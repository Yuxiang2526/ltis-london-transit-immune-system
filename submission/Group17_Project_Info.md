# London Transit Resilience System (LTRS)

**CASA0029 · Group 17 · Centre for Advanced Spatial Analysis, UCL**
**April 2026 · Word count: 955**

> Convert this file to `Group 17 Project Info.pdf` (or `.docx`) before
> submission. Pandoc one-liner: `pandoc Group17_Project_Info.md -o "Group 17 Project Info.pdf" --pdf-engine=xelatex`.

---

## Project URLs

| Resource | Link |
|---|---|
| **Final Assignment URL (live website)** | <https://yuxiang2526.github.io/ltis-london-transit-immune-system/> |
| **Project code files (web frontend)** | <https://github.com/Yuxiang2526/ltis-london-transit-immune-system> |
| **Interactive Map · code repository** | <https://github.com/Taoo2025/CASA0029> |
| **Data and Data-Processing Code Files** | <https://github.com/Taoo2025/CASA0029/tree/main/data_calculating> |

---

## Project Output Table

| # | Output | Location | Description |
|---|---|---|---|
| 1 | **Story** (scrollytelling narrative) | `/` route on the live site | Editorial three-act walk-through of the LTRS findings using routes 99, R2 and 685, with per-act camera fly-to and bolded key statistics. |
| 2 | **Explorer** (LSOA narrative dashboard) | `/explore` route | Routes ranking + Impact Matrix + LSOA baseline choropleth with hover-to-inspect Local Profile + Lorenz curve / Decile bars / Distribution panel + Key Findings + Planning Implications. |
| 3 | **Network Map** (forensic 100 m grid tool) | `/network` route | Full Mapbox GL JS map with Scenario Builder; user can cancel any combination of 543 routes and inspect the recomputed AI loss at native 100 m grid resolution; baseline / disrupted split-screen with draggable divider. |
| 4 | **Methodology** | `/methodology` route + `docs/methodology.md` | Five-section methodology summary (Introduction, Data, Methodology with formulas, Discussion & limitations, References). |
| 5 | **About** | `/about` route | Site structure, contributor portraits, public data sources, honest caveats about what the project does NOT do. |
| 6 | **Reproducible code** | `web/` (frontend) + companion repo `Taoo2025/CASA0029/data_calculating` (pipeline) | All scripts, data and configuration are open source under MIT licence (web) / public access (data pipeline). |

---

## Methodology Summary

### 1. Introduction

In complex urban systems, the stability of public transport networks affects
not only daily commuting efficiency, but also residents' access to jobs,
education, healthcare and public services. Previous studies have shown that
transport resilience is an important foundation for the functioning of urban
society (Chopra et al., 2016). At the same time, transport equity research
has gradually moved beyond simple measures of transport supply or passenger
capacity. It now pays more attention to whether different areas and social
groups can access travel opportunities fairly (Li et al., 2025). Recent
studies have also compared accessibility differences across education
groups, transport modes and job opportunities, showing that urban transport
systems can produce both spatial and social inequalities (Liu and Yu, 2025).

However, most existing studies focus on accessibility under normal
operating conditions. Less attention has been paid to whether different
areas can maintain their original accessibility when the transport network
is disrupted. For cities with complex public transport systems, high
accessibility in normal conditions does not necessarily mean strong
transport resilience. If an area depends heavily on a small number of key
routes or stations, its accessibility may drop quickly when these links are
disrupted. Therefore, transport equity should not only ask *who has better
accessibility in normal conditions*. It should also ask *who is more likely
to lose accessibility after a disruption*. Based on this research gap, this
project extends the focus from static accessibility distribution to
accessibility retention under route disruption scenarios. In this project,
this retention capacity is defined as **transport resilience**.

### 2. Data

This project uses multi-source open datasets to assess London's public
transport resilience at two spatial scales: 100 m grids and LSOAs.

1. **2023 PTAL dataset** — informs the baseline accessibility layer and
   measures the quality of public transport connectivity in London.
2. **Public transport access points** — derived from Great Britain's
   national NaPTAN dataset; London transport station and route data are
   used to represent local services. Night buses and temporary bus routes
   are excluded to mitigate the impact of irregular bus services on travel
   resilience. The GLA's Statistical GIS Boundary Files are used as a
   spatial mask to retain only transit data falling within the London
   administrative area.
3. **London network topology data** — supports the modelling of route
   disruption scenarios and accessibility change.

### 3. Methodology

The core contribution of this model lies in the development of an
interactive platform supporting "scenario analysis." Diverging from the
static PTAL data provided by TfL's official WebCAT, this model implements
real-time re-computation within the web browser. The specific operational
procedures are as follows:

1. **The baseline map is built on the 2023 PTAL values.** It visualises
   the current inequality in public transport connectivity shown by the
   official PTAL data.

2. **Following TfL's PTAL calculation logic**, the map estimates
   accessibility for each 100 m × 100 m grid using the real OSM walking
   network and open public transport stop data. For each grid centroid,
   reachable stops are identified within PTAL walking catchments: 640 m
   for bus stops and 960 m for rail-based stops. These catchments are
   measured along the OSM walking network with a walking speed of 4.8 km/h.
   The Accessibility Index is calculated by summing the contributions of
   all reachable routes:

   $$\text{AI}_i = \sum_{s \in S_i} \sum_{r \in R_s} C_{i s r}$$

   where $S_i$ is the set of reachable stops from grid $i$, $R_s$ is the
   set of routes serving stop $s$, and $C_{isr}$ is the accessibility
   contribution of route $r$ at stop $s$. The route contribution uses a
   distance-decay function:

   $$C_{i s r} = w_{i s r} \cdot \max\!\left(0,\; 1 - \frac{d_{i s}}{D_m}\right) \cdot 10$$

   where $w_{isr}$ is the route weight, $d_{is}$ is the OSM-network
   walking distance from grid $i$ to stop $s$, and $D_m$ is the
   mode-specific catchment distance. A closer stop gives a higher
   contribution, while a stop outside the catchment gives zero
   contribution.

   Next, the average reachability is calculated using LSOA-based polygonal
   spatial aggregation for macro-level analysis.

3. **When the user cancels selected routes**, the map recalculates
   grid-level accessibility by removing the AI contributions of those
   routes. The accessibility loss is measured as:

   $$\text{AI}_{\text{loss},\,i} = \text{AI}_{\text{baseline},\,i} - \text{AI}_{\text{disrupted},\,i}$$

   and the **Local Transit Resilience Score** is calculated as:

   $$\text{LTRS}_i = \frac{\text{AI}_{\text{disrupted},\,i}}{\text{AI}_{\text{baseline},\,i}}$$

   A larger accessibility drop indicates weaker resilience. Therefore, the
   lower the LTRS value, the more vulnerable the grid is under the
   selected route disruption scenario.

### 4. Discussion

Despite its effectiveness, this study has several limitations due to
computational constraints. First, our model does not fully replicate the
official TfL PTAL methodology. Specifically, we did not include frequency
attenuation or multi-modal transfers, such as moving from a bus to the
Underground. Furthermore, our analysis assumes a static environment and
does not account for service changes during weekends or peak hours.
Future research could improve these calculation methods to provide a more
realistic simulation. It is also important to integrate more
socio-demographic factors, such as the Index of Multiple Deprivation
(IMD). By performing an IMD overlay analysis, researchers can better
identify which vulnerable groups are most affected by transport
disruptions. This would help planners understand how transport resilience
contributes to wider social inequality in London.

### References

- Chopra, S. S. et al. (2016) "A network-based framework for assessing
  infrastructure resilience: a case study of the London metro system",
  *Journal of The Royal Society Interface*, 13(118), p. 20160113.
- Li, A. et al. (2025) "Ease and Equity of Point of Interest
  Accessibility via Public Transit in the U.S". *arXiv*.
- Liu, Z. and Yu, Z. (2025) "Transport equity assessment based on
  accessibility disparities in terms of multi-job opportunities across
  Beijing", *Scientific Reports*, 15(1), p. 30878.

---

## Appendix: Group Contribution and AI Declaration

### 1. Individual Contributions

As a two-person team, we collaborated closely throughout the project
lifecycle. The workload was distributed equally, and the partnership was
highly effective.

| Contributor | Role |
|---|---|
| **Siyan Tao** | Lead on **data engineering, geospatial preprocessing, and the development of the interactive Mapbox engine**. OSM walking-network extraction, per-100 m-grid Accessibility Index computation, 543-route per-cell loss matrix pre-computation, and the Mapbox GL JS Network Map UI (split-screen compare, route-cancel logic, postcode/borough navigation). |
| **Yuxiang Fan** | Lead on **front-end web architecture, UI/UX design, and the drafting of the methodology and urban analysis summary**. React + TypeScript + Vite skeleton, design system, scrollytelling narrative, LSOA aggregation views, methodology and About pages, GitHub Pages deployment. |

### 2. AI Tool Declaration

In line with the academic integrity policy for this module, we declare the
use of the following Artificial Intelligence tools.

- **Code development.** The team designed the main logic and system
  structure. Some modular code components were generated and refined with
  Vibecoding models. Claude and Codex were also used to help with
  debugging and code optimisation.
- **Conceptual design.** The research questions, the definition of LTRS
  (London Transit Resilience Score), and the scenario analysis method were
  developed by the team. AI tools were only used as brainstorming support
  during discussion.
- **Editing.** Gemini was used to check grammar and improve the clarity of
  the final methodology summary.

The final content, interpretation, and project decisions remain the
responsibility of the team.
