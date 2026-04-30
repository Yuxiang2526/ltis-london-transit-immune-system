"""
Build a small route-rankings JSON for the LTIS Explorer page.

Extracts the top 10 most-disruptive regular London routes from Siyan's
LSOA-level resilience summary. School / night / special services are
excluded so the ranking reflects routes that real residents lose during
typical service hours.

Inputs:
    London_PTAL_Accessibility_Map/resilience_summary_osm_network.json
    London_PTAL_Accessibility_Map/route_lines.geojson  (mode lookup)

Output:
    web/public/data/route_rankings.json
        { generatedFromRegularRoutes: int, top: [...], matrixTop10: [...] }
"""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "London_PTAL_Accessibility_Map"
RESILIENCE = SRC / "resilience_summary_osm_network.json"
ROUTE_LINES = SRC / "route_lines.geojson"
OUT = ROOT / "web" / "public" / "data" / "route_rankings.json"


def is_regular(route: str) -> bool:
    """Reject school services, night buses and "Special" variants."""
    if route.endswith("_Special/School"):
        return False
    if route.startswith("UL"):  # school routes
        return False
    if route.startswith("N") and len(route) <= 4 and route[1:].isdigit():
        return False  # night bus N1, N20...
    return True


def main():
    res = json.loads(RESILIENCE.read_text(encoding="utf-8"))
    sri = res["single_route_impacts"]

    # Mode lookup
    rl = json.loads(ROUTE_LINES.read_text(encoding="utf-8"))
    mode_by_route = {f["properties"]["route"]: f["properties"].get("mode", "bus") for f in rl["features"]}

    regular = [x for x in sri if is_regular(x["route"])]
    print(f"Regular routes: {len(regular)} / {len(sri)}")

    # Primary ranking — by LSOAs that lose 12-min access. Tiebreaker: mean_delay desc.
    ranked = sorted(
        regular,
        key=lambda x: (
            -x.get("lost_12min_access_lsoa", 0),
            -x.get("worsened_class_lsoa", 0),
            -x.get("mean_delay_min", 0),
        ),
    )

    def shape_record(r: dict) -> dict:
        return {
            "route":              r["route"],
            "mode":               mode_by_route.get(r["route"], "bus"),
            "affectedLsoa":       r.get("affected_lsoa", 0),
            "lost12minAccessLsoa": r.get("lost_12min_access_lsoa", 0),
            "worsenedClassLsoa":  r.get("worsened_class_lsoa", 0),
            "meanDelayMin":       round(r.get("mean_delay_min", 0), 2),
            "retentionRatio":     round(r.get("retention_ratio", 0), 4),
        }

    top5 = [shape_record(r) for r in ranked[:5]]
    top10 = [shape_record(r) for r in ranked[:10]]

    # For the impact matrix we want each metric normalised across the same set
    # so the colour intensity is comparable across columns.
    all_records = [shape_record(r) for r in regular]

    def metric_max(key: str) -> float:
        vals = [x[key] for x in all_records]
        return max(vals) if vals else 1

    norm_basis = {
        "affectedLsoa":        metric_max("affectedLsoa"),
        "lost12minAccessLsoa": metric_max("lost12minAccessLsoa"),
        "worsenedClassLsoa":   metric_max("worsenedClassLsoa"),
        "meanDelayMin":        metric_max("meanDelayMin"),
    }

    out = {
        "generatedFromRegularRoutes": len(regular),
        "totalRoutesIncludingSpecial": len(sri),
        "normaliseBasis": norm_basis,
        "top5":  top5,
        "top10": top10,
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(out, indent=2), encoding="utf-8")
    print(f"Wrote {OUT} ({OUT.stat().st_size} bytes)")
    print("\nTop 5:")
    for r in top5:
        print(f"  {r['route']:8} {r['mode']:4} affected={r['affectedLsoa']:4} "
              f"lost12={r['lost12minAccessLsoa']:3} delay={r['meanDelayMin']:5.2f} "
              f"ret={r['retentionRatio']*100:.1f}%")


if __name__ == "__main__":
    main()
