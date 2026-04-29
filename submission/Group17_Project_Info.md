# Group 17 — Project Info File

> CASA0029 Urban Data Visualisation, 2025–26
> *Convert this file to PDF (`Group 17 Project Info.pdf`) before submission.*

## Group members

| Name | Role |
|------|------|
| Yuxiang Fan | Frontend, design system, scrollytelling, deployment |
| Siyan Tao | Data pipeline, methodology writing, ADRs, references |

---

## Project Output Table

| Project Output | Description |
|---|---|
| **Project Output Files** | Zip file submitted on Moodle. Contains the full repository excluding `node_modules/`, `data/raw/`, `data/interim/`, `.venv/` and `.git/`. |
| **Project Website** | `https://<group17>.github.io/ltis-london-transit-immune-system/` *(replace before submission)* |
| **Project Methodology Summary (~1000 words)** | Located in the website's [`/methodology`](#) page **and** mirrored at [`docs/methodology.md`](../docs/methodology.md) in the repository. |

---

## Individual Contributions Outline Table

| Task | Major Contributors | Additional Contributors | Use of AI Tools |
|------|--------------------|--------------------------|------------------|
| Concept development & research question | Yuxiang Fan, Siyan Tao | — | No AI use |
| Data sourcing & licence audit | Siyan Tao | Yuxiang Fan | ChatGPT used to disambiguate the OS Open Roads vs OS Open Map Local licence terms |
| Data pipeline (`analysis/00–04`) | Siyan Tao | — | Claude used to scaffold the Jupyter notebook structure and to debug `geopandas` spatial joins; all analytical decisions and final code reviewed by Siyan Tao |
| Methodology writing (`docs/methodology.md`, ADRs) | Siyan Tao | Yuxiang Fan | ChatGPT used as a copy-editor for academic register; substantive content and citations are the authors' |
| Visualisation 1 — City-wide resilience map | Yuxiang Fan | — | Claude (Anthropic Claude Code) used to scaffold MapLibre layer setup and React component structure |
| Visualisation 2 — Disruption side-by-side comparison | Yuxiang Fan | Siyan Tao | Claude used to scaffold the small-multiples grid and synchronised tooltips |
| Visualisation 3 — Local fallback profile (5-dim radar) | Yuxiang Fan | — | Claude used for the SVG radar chart maths; visualisation choices reviewed against PPT slide 11 brief |
| Visualisation 4 — Distribution view (Lorenz / beeswarm) | Siyan Tao | Yuxiang Fan | No AI use |
| Visualisation 5 — Sensitivity strip | Siyan Tao | — | No AI use |
| Website framework & design system | Yuxiang Fan | — | Claude used to scaffold the React + TypeScript + Vite framework, the design-token CSS layer and the routing structure (story / explore / methodology / about) |
| Scrollytelling (Acts I–III) | Yuxiang Fan | Siyan Tao | Claude used to scaffold the IntersectionObserver `useScrollStage` hook and the act-stage container |
| Deployment (GitHub Pages + Actions) | Yuxiang Fan | — | No AI use |
| Open-science scaffolding (LICENSE, CITATION.cff, DATA_SOURCES.md, ADRs) | Yuxiang Fan, Siyan Tao | — | Claude used to draft the ADR template, content reviewed and revised by both authors |

### AI usage statement (summary)

The project used **Anthropic Claude (via Claude Code)** for code scaffolding, MapLibre layer wiring, React component structure, and ADR drafting. **OpenAI ChatGPT** was used for licence-term disambiguation and copy-editing the methodology summary. **No AI tool was used to generate analytical findings, methodological choices, citations, or final wording without author review.** Every AI-assisted artefact was inspected, revised and accepted by a named author before being committed.
