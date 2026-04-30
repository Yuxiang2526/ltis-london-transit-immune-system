# London Transit Resilience System (LTRS)

> *Exploring resilience and fallback mobility under public transport disruption in London.*
>
> CASA0029 Urban Data Visualisation — Group 17 (Yuxiang Fan, Siyan Tao)

[![Live site](https://img.shields.io/badge/site-live-brightgreen)](#)  &nbsp;
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)  &nbsp;
[![Methodology](https://img.shields.io/badge/methodology-summary-informational)](docs/methodology.md)

LTRS treats line disruption as a **stress test**: when a Tube line fails, which neighbourhoods still have alternatives, and which ones quickly become vulnerable? The project visualises **retained mobility, accessibility loss, population exposure and line dependency** at LSOA scale across Greater London, comparing a healthy baseline against a small set of pre-defined disruption scenarios.

The project deliverable is a website built with React + MapLibre, backed by a reproducible Python data pipeline.

---

## Repository layout

| Path | Purpose |
|---|---|
| [`web/`](web/)            | React + TypeScript + MapLibre frontend (the deliverable) |
| [`analysis/`](analysis/)  | Reproducible Jupyter pipeline (LSOA boundaries → PTAL → NaPTAN → scenario indicators) |
| [`data/`](data/)          | `raw/` (gitignored), `interim/`, `processed/` (used by `web/`) |
| [`docs/`](docs/)          | Methodology summary, screenshots, Architecture Decision Records |
| [`submission/`](submission/) | Final zipped deliverable + Project Info File |

## Quick start

### Web

```bash
cd web
npm install
npm run dev          # http://localhost:5173
npm run build        # type-check + production bundle
```

### Data pipeline

```bash
cd analysis
uv sync              # or: pip install -e .
jupyter lab          # then run 00 → 04 in order
```

The pipeline writes processed GeoJSON + JSON into `data/processed/`, which `web/public/data/` symlinks (or is copied from) for the live site.

## Methodology

A 1,000-word summary is in [`docs/methodology.md`](docs/methodology.md) and is also rendered inside the website at `/methodology`. Architecture Decision Records (ADRs) for non-obvious design choices live in [`docs/decisions/`](docs/decisions/).

## Data sources

All datasets, their URLs, vintage and license are listed in [`data/DATA_SOURCES.md`](data/DATA_SOURCES.md). Raw data is **not** committed; the pipeline downloads it on first run.

## Open science & AI use

This project follows open-science principles:
- All code is MIT-licensed and version-controlled here.
- All datasets are openly licensed; provenance is documented per-source.
- All third-party libraries are listed in `web/package.json` and `analysis/pyproject.toml`.
- AI-tool usage is itemised in [`submission/Group17_Project_Info.md`](submission/Group17_Project_Info.md) per the CASA0029 Contributions Table requirement.

## Citation

If you reference this project, please use the metadata in [`CITATION.cff`](CITATION.cff).

## License

[MIT](LICENSE)
