# Data sources

All datasets used by LTRS are openly licensed. The full per-grid AI and
per-route loss matrix is computed in the companion repo
<https://github.com/Taoo2025/CASA0029/tree/main/data_calculating>; this
file documents the upstream public datasets that feed that pipeline plus
the JSON / GeoJSON consumed directly by `web/`.

## Upstream public datasets

| ID | Dataset | Provider | Vintage | Licence | Used for |
|----|---------|----------|---------|---------|----------|
| `ptal_2023` | PTAL 100 m grid | TfL via [WebCAT](https://tfl.gov.uk/info-for/urban-planning-and-construction/planning-applications/planning-with-webcat) | 2023 | TfL Open Data licence | Baseline accessibility reference |
| `naptan` | National Public Transport Access Nodes | DfT via [data.gov.uk](https://www.data.gov.uk/dataset/ff93ffc1-6656-47d8-9155-85ea0b8f2251/naptan) | 2026 (snapshot) | OGL v3 | 27,553 transit access points |
| `osm_walking` | OpenStreetMap walking network for Greater London | OpenStreetMap contributors | 2026 (snapshot) | ODbL | Routable graph for grid → stop walks |
| `gla_boundary` | Statistical GIS Boundary Files for London | Greater London Authority via [data.london.gov.uk](https://data.london.gov.uk/dataset/statistical-gis-boundary-files-london) | 2021 | OGL v3 | London administrative spatial mask |
| `tfl_routes` | TfL line and route geometry (Tube, Overground, Elizabeth, DLR, Tramlink + 540+ buses) | TfL via [api.tfl.gov.uk](https://api.tfl.gov.uk/) | 2026 (live snapshot) | TfL Open Data licence | Visual route layer + cancellation logic |
| `lsoa_geom` | LSOA 2021 boundaries (BFE clipped to coast) | ONS Geography via [geoportal.statistics.gov.uk](https://geoportal.statistics.gov.uk/) | 2021 | OGL v3 | 4,994 LSOA polygons (Story + Explorer) |

Night buses and temporary bus routes are excluded from the route set so
that irregular service does not distort the resilience signal.

## Files consumed by `web/public/data/`

| File | Source | Description |
|------|--------|-------------|
| `lsoa_ltis.geojson` | `analysis/build_ltis_from_lsoa_summary.py` | 4,994 LSOA polygons + per-scenario loss/score for routes 99, R2 and 685 |
| `route_rankings.json` | Companion `data_calculating` repo | Top-routes ranking by lost 12-min access |
| `scenario_summary.json` | This repo (manually curated) | Borough-level summary of each pre-baked scenario |
| `rail_lines.geojson` | TfL + Mapbox styling | Rail / Tube / Overground / DLR overlay on the LSOA choropleth |
| `network-map/` | Companion `data_calculating` repo | Mapbox tiles + 543-route loss matrix consumed by the embedded Network Map |

## Caveats

- **Indicative population.** Every LSOA carries a default of 1,700 in the
  current data — a proxy, not the ONS mid-year estimate. The exposure
  metric should therefore be read as a relative ranking, not an absolute
  people-affected count, until the ONS join is wired in.
- **Walking-only fallback.** Cycling, micro-mobility and motorised modes
  are not in the AI calculation.
- **Static service.** Off-peak / weekend / late-night service is not
  modelled. Frequency attenuation is intentionally omitted (see
  Methodology §4).
- **No multi-modal transfers.** Bus → Underground transfers are not
  modelled; each grid's AI is the sum of contributions of all reachable
  stops independently.

## Licence statement on derived data

Processed outputs derived from the upstream sources above are derivative
works of the Open Government Licence v3, the TfL Open Data licence and the
Open Database Licence. All three require attribution; the live site
carries the required attribution string in the footer and About page.
