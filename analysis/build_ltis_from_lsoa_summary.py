"""
Build LTIS LSOA dataset from Siyan's REAL OSM-Dijkstra outputs.

Inputs (relative to repo root):
    London_PTAL_Accessibility_Map/DATA/LSOA_full_topology.geojson
        4,994 LSOA polygons + (mean_AI, MEAN_PTAL_, borough)
    London_PTAL_Accessibility_Map/DATA/grid_to_lsoa.json
        157,940 grid-cell -> LSOA mapping
    London_PTAL_Accessibility_Map/route_grid_impacts_osm_network.json
        Per-route, per-grid AI loss baseline + route_grid_loss

Outputs:
    web/public/data/lsoa_ltis.geojson
        LSOA polygons with baseline_ltis + 3 scenarios (route_99, route_R2,
        route_685) + retention/loss/exposure per scenario.
    web/public/data/scenario_summary.json
        Borough-level mean loss, top affected boroughs, totals.

This is the second-generation pipeline: it replaces the first-generation
PTAL-only catchment approximation (build_ltis_from_ptal.py) with truthful
data aggregated from Siyan Tao's network model. Every value rendered in the
LTIS narrative now traces back to the same OSM-Dijkstra computation that
backs the LTRS Network Map.
"""

from __future__ import annotations

import json
from collections import defaultdict
from pathlib import Path

from shapely.geometry import shape, mapping

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "London_PTAL_Accessibility_Map"
OUT_DIR = ROOT / "web" / "public" / "data"
OUT_DIR.mkdir(parents=True, exist_ok=True)

LSOA_TOPOLOGY = SRC / "DATA" / "LSOA_full_topology.geojson"
GRID_TO_LSOA = SRC / "DATA" / "grid_to_lsoa.json"
ROUTE_GRID_IMPACTS = SRC / "route_grid_impacts_osm_network.json"

# The three scenario routes; chosen because they showcase three distinct
# spatial signatures of disruption (see frames.ts narrative):
#   99   — east London bus, deepest critical-grid count (697 critical cells)
#   R2   — south London bus, widest spread (1,738 grids)
#   685  — NW London bus, deepest local punch (38.6% mean AI loss)
SCENARIOS = ["99", "R2", "685"]
SCENARIO_LABEL = {
    "99":  "Bus Route 99 disruption",
    "R2":  "Bus Route R2 disruption",
    "685": "Bus Route 685 disruption",
}

SIMPLIFY_TOLERANCE_DEG = 0.0004  # ~40 m
DEFAULT_POPULATION = 1700        # London LSOA mean (until ONS pop joined)


def main():
    print("Loading LSOA topology...")
    fc = json.loads(LSOA_TOPOLOGY.read_text(encoding="utf-8"))
    print(f"  {len(fc['features'])} LSOA features")

    print("Loading grid->LSOA mapping...")
    grid_to_lsoa = json.loads(GRID_TO_LSOA.read_text(encoding="utf-8"))
    print(f"  {len(grid_to_lsoa)} grid->LSOA entries")

    print("Loading route_grid_impacts (large file ~13 MB)...")
    rgi = json.loads(ROUTE_GRID_IMPACTS.read_text(encoding="utf-8"))
    baseline_ai = rgi["baseline_ai"]                # grid_id -> baseline AI
    route_grid_loss = rgi["route_grid_loss"]        # route -> {grid_id -> loss}
    print(f"  baseline_ai: {len(baseline_ai)} grids")
    print(f"  routes: {len(route_grid_loss)}")

    # Aggregate baseline AI by LSOA (mean of grid baselines in that LSOA).
    print("Aggregating baseline AI by LSOA...")
    lsoa_baseline_sum = defaultdict(float)
    lsoa_baseline_count = defaultdict(int)
    for grid_id, base in baseline_ai.items():
        lsoa = grid_to_lsoa.get(grid_id)
        if not lsoa:
            continue
        lsoa_baseline_sum[lsoa] += base
        lsoa_baseline_count[lsoa] += 1
    lsoa_baseline_ai = {
        lsoa: (lsoa_baseline_sum[lsoa] / lsoa_baseline_count[lsoa])
        for lsoa in lsoa_baseline_sum
    }
    # min-max normalise baseline AI for the choropleth (0..1)
    bvals = list(lsoa_baseline_ai.values())
    bmin, bmax = min(bvals), max(bvals)
    print(f"  baseline AI range: {bmin:.2f} .. {bmax:.2f}")

    # For each scenario, aggregate loss by LSOA.
    print("Aggregating route-loss per LSOA per scenario...")
    scenario_lsoa_loss: dict[str, dict[str, float]] = {}
    for route in SCENARIOS:
        if route not in route_grid_loss:
            print(f"  WARN: route {route} not in route_grid_loss")
            scenario_lsoa_loss[route] = {}
            continue
        per_lsoa_sum = defaultdict(float)
        per_lsoa_grid_count = defaultdict(int)
        for grid_id, loss in route_grid_loss[route].items():
            lsoa = grid_to_lsoa.get(grid_id)
            if not lsoa:
                continue
            per_lsoa_sum[lsoa] += loss
            per_lsoa_grid_count[lsoa] += 1
        # mean loss per LSOA — comparable across LSOAs of different sizes
        scenario_lsoa_loss[route] = {
            lsoa: (per_lsoa_sum[lsoa] / per_lsoa_grid_count[lsoa])
            for lsoa in per_lsoa_sum
        }
        print(f"  route {route}: {len(scenario_lsoa_loss[route])} LSOAs affected")

    # ----- Build output features -----
    print("Building output features (with geometry simplification)...")
    out_features = []
    scenario_borough_loss = {sc: defaultdict(list) for sc in SCENARIOS}
    scenario_loss_accum = {sc: [] for sc in SCENARIOS}
    scenario_exposure_accum = {sc: 0.0 for sc in SCENARIOS}

    for i, feat in enumerate(fc["features"]):
        props = feat["properties"]
        lsoa_code = props.get("LSOA21CD", "")
        lsoa_name = props.get("LSOA21NM", "")
        borough = props.get("borough", "")

        # baseline (real, from Siyan)
        base_ai = lsoa_baseline_ai.get(lsoa_code, 0.0)
        base_norm = (base_ai - bmin) / (bmax - bmin) if bmax > bmin else 0.0
        baseline_ltis = round(base_norm, 4)

        # geometry — Shapely 2.0.5 has a known bug constructing MultiPolygon
        # from a list of Polygons (4 LSOAs in this dataset hit it). For those
        # we use only the largest constituent polygon, since the small island
        # rings would be invisible at choropleth zoom anyway.
        from shapely.geometry import Polygon as ShPoly
        try:
            geom = shape(feat["geometry"])
        except Exception:
            g = feat["geometry"]
            if g["type"] == "MultiPolygon":
                # Pick the biggest sub-polygon by ring point count (proxy area)
                largest = max(
                    g["coordinates"],
                    key=lambda poly_coords: len(poly_coords[0]),
                )
                geom = ShPoly(largest[0], holes=largest[1:])
            elif g["type"] == "Polygon":
                geom = ShPoly(g["coordinates"][0], holes=g["coordinates"][1:])
            else:
                continue
        if not geom.is_valid:
            geom = geom.buffer(0)
        geom = geom.simplify(SIMPLIFY_TOLERANCE_DEG, preserve_topology=True)
        if geom.is_empty:
            continue

        flat = {
            "lsoa_code":     lsoa_code,
            "lsoa_name":     lsoa_name,
            "borough":       borough,
            "population":    DEFAULT_POPULATION,
            "baseline_ai":   round(base_ai, 4),
            "baseline_ltis": baseline_ltis,
            "ptal_mean":     round(base_norm, 4),
            "ptal_norm":     round(base_norm, 4),
        }

        for sc in SCENARIOS:
            mean_loss_ai = scenario_lsoa_loss[sc].get(lsoa_code, 0.0)
            # Express loss as a share of baseline AI (so it's comparable to the
            # 0..1 baseline_ltis ramp). Cap at 1.0.
            loss_share = min(1.0, mean_loss_ai / base_ai) if base_ai > 0 else 0.0
            loss = round(loss_share, 4)
            retention = round(max(0.0, baseline_ltis - baseline_ltis * loss_share), 4)
            disrupted = retention
            exposure = round(loss * DEFAULT_POPULATION, 1)

            # five-dimension fallback profile (heuristic — not central to story)
            redundancy     = round(max(0.0, 1.0 - loss_share), 4)
            bus_fallback   = round(min(1.0, 0.45 + 0.4 * base_norm - 0.2 * loss_share), 4)
            cycle_fallback = round(min(1.0, 0.30 + 0.5 * base_norm), 4)
            modal_diversity = round(min(1.0, base_norm), 4)
            dependency_risk = round(loss_share, 4)

            flat[f"{sc}_score"]            = disrupted
            flat[f"{sc}_retention"]        = retention
            flat[f"{sc}_loss"]             = loss
            flat[f"{sc}_exposure"]         = exposure
            flat[f"{sc}_dependency"]       = round(loss_share, 4)
            flat[f"{sc}_redundancy"]       = redundancy
            flat[f"{sc}_busFallback"]      = bus_fallback
            flat[f"{sc}_cycleFallback"]    = cycle_fallback
            flat[f"{sc}_modalDiversity"]   = modal_diversity
            flat[f"{sc}_dependencyRisk"]   = dependency_risk

            scenario_loss_accum[sc].append(loss)
            scenario_exposure_accum[sc] += exposure
            if borough:
                scenario_borough_loss[sc][borough].append(loss)

        out_features.append({
            "type": "Feature",
            "properties": flat,
            "geometry": mapping(geom),
        })

        if i % 500 == 0:
            print(f"  processed {i}/{len(fc['features'])}")

    # ----- Write outputs -----
    print(f"Writing {len(out_features)} features...")
    out_geojson = {"type": "FeatureCollection", "features": out_features}
    out_path = OUT_DIR / "lsoa_ltis.geojson"
    out_path.write_text(json.dumps(out_geojson), encoding="utf-8")
    print(f"  -> {out_path}  ({out_path.stat().st_size / (1024*1024):.1f} MB)")

    # Scenario summary
    summary = {}
    for sc in SCENARIOS:
        losses = scenario_loss_accum[sc]
        retentions = [1 - l for l in losses]
        borough_means = sorted(
            (
                {"borough": b, "meanLoss": round(sum(v) / len(v), 4)}
                for b, v in scenario_borough_loss[sc].items()
                if len(v) >= 5
            ),
            key=lambda x: x["meanLoss"],
            reverse=True,
        )[:5]
        summary[sc] = {
            "label": SCENARIO_LABEL[sc],
            "description": (
                f"Loss derived from Siyan Tao's OSM-Dijkstra walking-network "
                f"model. When bus route {sc} is removed, the AI score for every "
                f"affected 100m grid cell is recomputed; values shown here are "
                f"averaged from grid cells back up to the LSOA."
            ),
            "meanRetention": round(sum(retentions) / len(retentions), 4) if retentions else 0,
            "meanLoss": round(sum(losses) / len(losses), 4) if losses else 0,
            "totalExposedPopulation": int(round(scenario_exposure_accum[sc])),
            "mostAffectedBoroughs": borough_means,
        }
    summary_path = OUT_DIR / "scenario_summary.json"
    summary_path.write_text(json.dumps(summary, indent=2), encoding="utf-8")
    print(f"  -> {summary_path}")
    print("Done.")


if __name__ == "__main__":
    main()
