# London Transit Resilience System (LTRS)

> *Exploring resilience and fallback mobility under public transport disruption in London.*
>
> CASA0029 Urban Data Visualisation — Group 17 (Yuxiang Fan, Siyan Tao)

[![Live site](https://img.shields.io/badge/site-live-brightgreen)](#)  &nbsp;
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)  &nbsp;
[![Methodology](https://img.shields.io/badge/methodology-summary-informational)](docs/methodology.md)

LTRS treats single-route disruption as a **stress test** on London's surface
public transport network: when a specific bus route is removed, which
neighbourhoods still have alternatives, and which become sharply more
vulnerable? The project recomputes per-grid accessibility on the OSM walking
network, ranks all 543 routes by their disruption footprint, and visualises
**baseline accessibility, accessibility loss, retention and indicative
exposure** at LSOA and 100 m grid scale across Greater London.

The deliverable is an interactive website (React + TypeScript + MapLibre +
embedded Mapbox GL JS Network Map) backed by a Python data pipeline.

---

## Repository layout

| Path | Purpose |
|---|---|
| [`web/`](web/)            | React + TypeScript + Vite frontend (the deliverable) |
| [`web/public/network-map/`](web/public/network-map/) | Standalone Mapbox GL JS Network Map (Siyan's engine) |
| [`web/public/data/`](web/public/data/)               | Pre-computed GeoJSON / JSON consumed by the site |
| [`analysis/`](analysis/)  | Python aggregation scripts (grid → LSOA roll-up) |
| [`docs/`](docs/)          | Methodology summary + Architecture Decision Records |
| [`submission/`](submission/) | Final Project Info File (PDF/DOCX) and zipped deliverable |

The full data-calculation pipeline (OSM walking-network extraction, per-grid
AI computation, the 543-route per-cell loss matrix and all input metadata)
is in a separate companion repo:

> **<https://github.com/Taoo2025/CASA0029/tree/main/data_calculating>**

## Quick start

### Web

```bash
cd web
npm install
npm run dev          # http://localhost:5173
npm run build        # type-check + production bundle
npm run lint         # ESLint must pass with no errors
```

### LSOA aggregation

```bash
cd analysis
uv sync              # or: pip install -e .
python build_ltis_from_lsoa_summary.py
```

The aggregation script writes `web/public/data/lsoa_ltis.geojson` from
the per-grid AI / loss matrix produced upstream.

## Methodology

A ~1,000-word summary is rendered inside the website at `/methodology` and
mirrored in [`docs/methodology.md`](docs/methodology.md). Architecture
Decision Records (ADRs) for non-obvious choices live in
[`docs/decisions/`](docs/decisions/).

The metric definitions used everywhere on the site:

| Metric | Definition |
|---|---|
| **Baseline AI** | $\sum_{s\in S_i}\sum_{r\in R_s} C_{isr}$ where $C_{isr}=w_{isr}\cdot\max(0,\,1-d_{is}/D_m)\cdot 10$. PTAL-style distance decay on the OSM walking network. |
| **Disrupted AI** | Baseline AI minus the contributions of routes in the cancelled set. |
| **Loss share** | $1 - \text{AI}_{\text{disrupted}} / \text{AI}_{\text{baseline}}$. |
| **LTRS / Retention** | $\text{AI}_{\text{disrupted}} / \text{AI}_{\text{baseline}} \in [0, 1]$. Lower = more vulnerable. |
| **Indicative exposure** | Loss share × 1,700 (proxy population per LSOA). Treat as relative ranking, not absolute people-affected counts, until ONS mid-year population is joined. |

## Data sources

All datasets are publicly available under permissive licences. Full URLs,
vintages and licence terms are in [`data/DATA_SOURCES.md`](data/DATA_SOURCES.md)
and the About page on the live site.

- **PTAL 2023** (TfL WebCAT) — baseline accessibility reference
- **NaPTAN** (DfT, OGL v3) — 27,553 transit access points
- **OSM walking network** (ODbL) — routable graph for grid → stop walks
- **GLA Statistical GIS Boundary Files** — London administrative mask
- **TfL line and route geometry** — Tube, Overground, DLR, 540+ buses
- **ONS LSOA 2021 boundaries** — narrative spatial unit (4,994 polygons)

## Citation

If you reference this project, please use the metadata in [`CITATION.cff`](CITATION.cff).

## License

[MIT](LICENSE)
