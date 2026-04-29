"""
Build LTIS LSOA dataset from real PTAL 2023 + Underground stations.

Inputs (relative to repo root):
    London_PTAL_Accessibility_Map/DATA/LSOA_aggregated_PTAL_stats_2023.geojson
    London_PTAL_Accessibility_Map/DATA/Underground_Stations.geojson

Outputs:
    web/public/data/lsoa_ltis.geojson
    web/public/data/scenario_summary.json
    web/public/data/tube_stations.geojson
    web/public/data/tube_lines.geojson  (rough centroid-chain per line)
"""

from __future__ import annotations

import json
import math
from collections import defaultdict
from pathlib import Path

from shapely.geometry import shape, mapping, Point, LineString
from shapely.ops import unary_union

ROOT = Path(__file__).resolve().parents[1]
PTAL_GEOJSON = ROOT / "London_PTAL_Accessibility_Map" / "DATA" / "LSOA_aggregated_PTAL_stats_2023.geojson"
TUBE_STATIONS_GEOJSON = ROOT / "London_PTAL_Accessibility_Map" / "DATA" / "Underground_Stations.geojson"
OUT_DIR = ROOT / "web" / "public" / "data"
OUT_DIR.mkdir(parents=True, exist_ok=True)

# Scenarios MUST match SCENARIO_REGISTRY in web/src/data/scenarios.ts
SCENARIOS = ["central", "northern", "jubilee"]
SCENARIO_LINE_NAME = {
    "central": "Central",
    "northern": "Northern",
    "jubilee": "Jubilee",
}
SCENARIO_LABEL = {
    "central": "Central line disruption",
    "northern": "Northern line disruption",
    "jubilee": "Jubilee line disruption",
}

# Tunable
SIMPLIFY_TOLERANCE_DEG = 0.0004      # ~40 m, small enough to preserve LSOA shape
CATCHMENT_RADIUS_DEG = 0.012         # ~1.3 km — typical walk catchment
SEVERITY = 0.55                       # max share of baseline lost when fully dependent
DEFAULT_POPULATION = 1700             # rough London LSOA mean (no real pop joined yet)


def haversine_deg(lon1, lat1, lon2, lat2):
    # cheap planar approximation; LSOAs already have small extents
    return math.hypot(lon1 - lon2, lat1 - lat2)


def ptal_label_to_score(label: str | None) -> float:
    """PTAL band ('1a'..'6b') → 0..1 normalized accessibility."""
    if not label:
        return 0.0
    table = {
        "0": 0.05, "1a": 0.1, "1b": 0.18, "2": 0.30, "3": 0.45,
        "4": 0.60, "5": 0.75, "6a": 0.88, "6b": 1.0,
    }
    return table.get(str(label).strip().lower(), 0.0)


def normalize(value, lo, hi):
    if hi <= lo:
        return 0.0
    return max(0.0, min(1.0, (value - lo) / (hi - lo)))


def main():
    print("Loading PTAL LSOA geojson...")
    ptal = json.loads(PTAL_GEOJSON.read_text(encoding="utf-8"))
    print(f"  {len(ptal['features'])} features")

    print("Loading Underground stations...")
    stations = json.loads(TUBE_STATIONS_GEOJSON.read_text(encoding="utf-8"))
    print(f"  {len(stations['features'])} stations")

    # Index station coords by line name
    line_stations: dict[str, list[tuple[float, float]]] = defaultdict(list)
    all_station_coords: list[tuple[float, float]] = []
    for f in stations["features"]:
        if f["geometry"]["type"] != "Point":
            continue
        x, y = f["geometry"]["coordinates"][0], f["geometry"]["coordinates"][1]
        all_station_coords.append((x, y))
        lines_field = f["properties"].get("LINES", "") or ""
        for ln in [s.strip() for s in lines_field.split(",")]:
            if ln:
                line_stations[ln].append((x, y))

    print("Lines indexed:", {k: len(v) for k, v in line_stations.items() if k in SCENARIO_LINE_NAME.values()})

    # Build mean_AI normalisation range for baseline_ltis
    ai_values = []
    for feat in ptal["features"]:
        v = feat["properties"].get("mean_AI")
        if isinstance(v, (int, float)):
            ai_values.append(v)
    ai_lo, ai_hi = min(ai_values), max(ai_values)
    print(f"mean_AI range: {ai_lo:.2f} .. {ai_hi:.2f}")

    out_features = []
    scenario_loss_accum = {s: [] for s in SCENARIOS}
    scenario_exposure_accum = {s: 0.0 for s in SCENARIOS}
    scenario_borough_loss = {s: defaultdict(list) for s in SCENARIOS}

    for i, feat in enumerate(ptal["features"]):
        props = feat["properties"]
        geom = shape(feat["geometry"])
        if not geom.is_valid:
            geom = geom.buffer(0)
        # simplify to keep file size reasonable
        geom = geom.simplify(SIMPLIFY_TOLERANCE_DEG, preserve_topology=True)
        if geom.is_empty:
            continue

        centroid = geom.centroid
        cx, cy = centroid.x, centroid.y

        baseline_norm = normalize(props.get("mean_AI", 0.0), ai_lo, ai_hi)
        ptal_label = props.get("MEAN_PTAL_")
        ptal_norm = ptal_label_to_score(ptal_label)
        baseline_ltis = round(0.6 * baseline_norm + 0.4 * ptal_norm, 4)

        # Stations within walking catchment
        nearby_total = 0
        nearby_per_line: dict[str, int] = defaultdict(int)
        for sx, sy in all_station_coords:
            if haversine_deg(cx, cy, sx, sy) <= CATCHMENT_RADIUS_DEG:
                nearby_total += 1
        for line_name, coords in line_stations.items():
            for sx, sy in coords:
                if haversine_deg(cx, cy, sx, sy) <= CATCHMENT_RADIUS_DEG:
                    nearby_per_line[line_name] += 1

        flat: dict = {
            "lsoa_code": props.get("LSOA21CD", ""),
            "lsoa_name": props.get("LSOA21NM", ""),
            "borough": props.get("borough", ""),
            "population": DEFAULT_POPULATION,
            "baseline_ltis": baseline_ltis,
            "ptal_mean": baseline_norm,
            "ptal_norm": ptal_norm,
            "stop_supply": nearby_total,
            "mode_diversity": round(min(1.0, len(nearby_per_line) / 6.0), 4),
            "micro_mobility": round(0.4 + 0.5 * baseline_norm, 4),
        }

        for sc in SCENARIOS:
            line_name = SCENARIO_LINE_NAME[sc]
            on_line = nearby_per_line.get(line_name, 0)
            if nearby_total > 0:
                dependency = on_line / nearby_total
            else:
                dependency = 0.0
            # If LSOA has no nearby tube at all, baseline is dominated by bus → small loss
            base_loss = baseline_ltis * dependency * SEVERITY
            # Outer LSOAs without any tube still feel small ripple via bus reroutes
            if nearby_total == 0:
                base_loss = baseline_ltis * 0.04
            loss = round(base_loss, 4)
            retention = round(max(0.0, baseline_ltis - loss), 4)
            disrupted_ltis = retention
            exposure = round(loss * DEFAULT_POPULATION, 1)

            redundancy = round(max(0.0, 1.0 - dependency), 4)
            bus_fallback = round(min(1.0, 0.45 + 0.4 * baseline_norm - 0.2 * dependency), 4)
            cycle_fallback = round(min(1.0, 0.30 + 0.5 * baseline_norm), 4)
            modal_diversity = flat["mode_diversity"]
            dependency_risk = round(dependency, 4)

            flat[f"{sc}_score"] = disrupted_ltis
            flat[f"{sc}_retention"] = retention
            flat[f"{sc}_loss"] = loss
            flat[f"{sc}_exposure"] = exposure
            flat[f"{sc}_dependency"] = dependency_risk
            flat[f"{sc}_redundancy"] = redundancy
            flat[f"{sc}_busFallback"] = bus_fallback
            flat[f"{sc}_cycleFallback"] = cycle_fallback
            flat[f"{sc}_modalDiversity"] = modal_diversity
            flat[f"{sc}_dependencyRisk"] = dependency_risk

            scenario_loss_accum[sc].append(loss)
            scenario_exposure_accum[sc] += exposure
            if flat["borough"]:
                scenario_borough_loss[sc][flat["borough"]].append(loss)

        out_features.append({
            "type": "Feature",
            "properties": flat,
            "geometry": mapping(geom),
        })

        if i % 500 == 0:
            print(f"  processed {i}/{len(ptal['features'])}")

    print(f"Writing {len(out_features)} LSOA features...")
    out_geojson = {"type": "FeatureCollection", "features": out_features}
    out_path = OUT_DIR / "lsoa_ltis.geojson"
    out_path.write_text(json.dumps(out_geojson), encoding="utf-8")
    size_mb = out_path.stat().st_size / (1024 * 1024)
    print(f"  -> {out_path}  ({size_mb:.1f} MB)")

    # Scenario summary
    summary = {}
    for sc in SCENARIOS:
        losses = scenario_loss_accum[sc]
        retentions = [1 - l for l in losses]  # rough; baseline differs but ok as headline
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
                f"Scenario derived from real PTAL 2023 accessibility and proximity "
                f"to {SCENARIO_LINE_NAME[sc]} line stations. Loss is proportional to "
                f"local dependency on the disrupted line within a ~1.3 km walking catchment."
            ),
            "meanRetention": round(sum(retentions) / len(retentions), 4) if retentions else 0,
            "meanLoss": round(sum(losses) / len(losses), 4) if losses else 0,
            "totalExposedPopulation": int(round(scenario_exposure_accum[sc])),
            "mostAffectedBoroughs": borough_means,
        }
    (OUT_DIR / "scenario_summary.json").write_text(json.dumps(summary, indent=2), encoding="utf-8")
    print(f"  -> {OUT_DIR / 'scenario_summary.json'}")

    # Tube stations passthrough (slim props)
    slim_stations = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "properties": {
                    "name": f["properties"].get("NAME"),
                    "lines": f["properties"].get("LINES"),
                    "accessible": f["properties"].get("ACCESSIBILITY"),
                },
                "geometry": f["geometry"],
            }
            for f in stations["features"]
            if f["geometry"]["type"] == "Point"
        ],
    }
    (OUT_DIR / "tube_stations.geojson").write_text(json.dumps(slim_stations), encoding="utf-8")
    print(f"  -> {OUT_DIR / 'tube_stations.geojson'}  ({len(slim_stations['features'])} stations)")

    # Rough tube line geometry: chain stations of a line by nearest-neighbour from west-most.
    line_features = []
    for line_name, coords in line_stations.items():
        if len(coords) < 2:
            continue
        remaining = list(coords)
        # start at the westernmost station
        remaining.sort(key=lambda c: c[0])
        ordered = [remaining.pop(0)]
        while remaining:
            last = ordered[-1]
            nxt_idx = min(
                range(len(remaining)),
                key=lambda j: haversine_deg(last[0], last[1], remaining[j][0], remaining[j][1]),
            )
            ordered.append(remaining.pop(nxt_idx))
        line_features.append({
            "type": "Feature",
            "properties": {"line": line_name},
            "geometry": mapping(LineString(ordered)),
        })
    lines_geojson = {"type": "FeatureCollection", "features": line_features}
    (OUT_DIR / "tube_lines.geojson").write_text(json.dumps(lines_geojson), encoding="utf-8")
    print(f"  -> {OUT_DIR / 'tube_lines.geojson'}  ({len(line_features)} lines)")

    print("Done.")


if __name__ == "__main__":
    main()
