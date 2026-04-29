# LTIS data pipeline

Reproducible Jupyter pipeline that turns raw open-data sources into the JSON / GeoJSON files consumed by `web/`.

## Notebooks

Run **in numerical order**. Each notebook reads from the previous step's output and writes to the next layer.

| # | Notebook | Reads | Writes | Owner |
|---|----------|-------|--------|-------|
| 00 | `00_fetch_raw.ipynb` | upstream URLs (see [`../data/DATA_SOURCES.md`](../data/DATA_SOURCES.md)) | `data/raw/<dataset>/` + `_meta.json` | Siyan |
| 01 | `01_clean_join.ipynb` | `data/raw/` | `data/interim/lsoa_joined.parquet` | Siyan |
| 02 | `02_compute_baseline_ltis.ipynb` | `data/interim/lsoa_joined.parquet` | `data/interim/lsoa_baseline.parquet` | Siyan |
| 03 | `03_simulate_scenarios.ipynb` | baseline + NaPTAN + line geometry | `data/processed/lsoa_ltis.geojson`, `data/processed/scenario_summary.json` | Siyan |
| 04 | `04_validate_sensitivity.ipynb` | processed outputs | `data/processed/sensitivity.json`, plots in `docs/figures/` | both |

## Layered data folders

```
data/raw/         <- downloaded as-is, never committed
data/interim/     <- reshaped intermediates, never committed
data/processed/   <- final small artefacts, committed and shipped to web/
```

## Running the pipeline

```bash
# Option A: uv (recommended — fast, lockfile-managed)
uv sync
uv run jupyter lab

# Option B: pip
python -m venv .venv && source .venv/bin/activate   # or .venv\Scripts\activate on Windows
pip install -e .
jupyter lab
```

Then open the notebooks and run them in order. Each notebook is **idempotent** — re-running it produces byte-identical output unless an upstream input changed.

## Conventions

- All flat property keys for the website use **snake_case** and follow the schema documented in [`../web/src/data/schema.ts`](../web/src/data/schema.ts). Per-scenario keys are `{scenarioId}_{field}`.
- All numeric metrics are stored as `float32` in interim Parquet, rounded to **3 decimal places** in the final GeoJSON to keep file size down.
- Geometry is simplified with `geopandas.GeoSeries.simplify(tolerance=0.0001)` for the city-wide map (≈10 m tolerance at London latitude).

## What this notebook chain replaces

The website ships with `web/public/data/lsoa_ltis_demo.geojson` — a tiny hand-crafted demo file used for skeleton development. Once the pipeline runs, the processed output supersedes the demo.
