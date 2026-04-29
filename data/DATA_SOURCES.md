# Data sources

All datasets used by the LTIS pipeline are openly licensed. Raw files are **not** committed to the repository — the `analysis/00_fetch_raw.ipynb` notebook downloads them on first run.

| ID | Dataset | Provider | Vintage | License | Used for |
|----|---------|----------|---------|---------|----------|
| `lsoa_pop` | LSOA population estimates | ONS via [data.london.gov.uk](https://data.london.gov.uk/dataset/super-output-area-population-lsoa-msoa-london-2g1zq/) | 2021 (mid-year) | OGL v3 | Population exposure, spatial unit |
| `lsoa_geom` | LSOA 2021 boundaries (BFE clipped to coast) | ONS Geography via [geoportal.statistics.gov.uk](https://geoportal.statistics.gov.uk/) | 2021 | OGL v3 | LSOA polygons for the choropleth |
| `ptal_2015` | PTAL grid (100 m) | TfL via [WebCAT](https://tfl.gov.uk/info-for/urban-planning-and-construction/planning-applications/planning-with-webcat) | 2015 | TfL Open Data licence | Baseline accessibility component |
| `naptan` | National Public Transport Access Nodes | DfT via [data.gov.uk](https://www.data.gov.uk/dataset/ff93ffc1-6656-47d8-9155-85ea0b8f2251/naptan) | 2026 (snapshot) | OGL v3 | Stop / station locations, mode diversity |
| `tfl_lines` | TfL station and line geometry (Tube, Overground, DLR, Elizabeth) | TfL via [api.tfl.gov.uk](https://api.tfl.gov.uk/) | 2026 (live snapshot) | TfL Open Data licence | Disrupted-line geometry overlay |
| `imd_2019` | English Indices of Multiple Deprivation | MHCLG via [gov.uk](https://www.gov.uk/government/statistics/english-indices-of-deprivation-2019) | 2019 | OGL v3 | Equity-weighted exposure |
| `os_open_roads` | OS Open Roads | Ordnance Survey via [osdatahub.os.uk](https://osdatahub.os.uk/downloads/open/OpenRoads) | 2026 | OGL v3 | Walking / cycling fallback estimation |

## Caveats

- **PTAL 2015** is the most recent published grid release (TfL has since shifted to per-request WebCAT calculations). The 11-year vintage means new high-PTAL areas (Elizabeth line corridor, Battersea Power Station extension) are systematically underrepresented. The methodology page documents this and where it biases the conclusions.
- **NaPTAN** snapshots reflect *known* stop locations, not real-time service levels.
- **IMD 2019** is the latest published edition at time of writing (2026-04). A 2025 release was promised but has not been published.

## Provenance

Each raw file lands in `data/raw/<dataset_id>/` along with a `_meta.json` capturing the download URL, fetched timestamp, and SHA-256 hash. The `analysis/00_fetch_raw.ipynb` notebook is the single source of truth for these downloads.

## Licence statement on derived data

Processed outputs in `data/processed/` are derivative works of the upstream Open Government Licence and TfL Open Data licence sources. Both licences require attribution; the live website carries the required attribution string in its footer and methodology page.
