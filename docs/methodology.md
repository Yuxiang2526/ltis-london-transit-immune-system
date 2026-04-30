# LTRS — Methodology Summary

> CASA0029 Urban Data Visualisation, Group 17 (Yuxiang Fan, Siyan Tao)
> Word count: ~955 words. The same content is rendered on the live site at
> `/methodology`; this file is the static mirror.

## 1. Introduction

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

## 2. Data

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

## 3. Methodology

The core contribution of this model lies in the development of an
interactive platform supporting *scenario analysis*. Diverging from the
static PTAL data provided by TfL's official WebCAT, this model implements
real-time re-computation within the web browser. Three steps:

### 3.1 Baseline map

The baseline map is built on the 2023 PTAL values. It visualises the current
inequality in public transport connectivity shown by the official PTAL data.
The Story page and the Explorer use this layer aggregated to LSOA scale; the
Network Map preserves it at native 100 m resolution.

### 3.2 Per-grid Accessibility Index

Following TfL's PTAL calculation logic, the map estimates accessibility for
each 100 m × 100 m grid using the real OSM walking network and open public
transport stop data. For each grid centroid, reachable stops are identified
within PTAL walking catchments: **640 m** for bus stops and **960 m** for
rail-based stops. These catchments are measured along the OSM walking
network with a walking speed of 4.8 km/h. The Accessibility Index is then
calculated by summing the contributions of all reachable routes:

$$\text{AI}_i = \sum_{s \in S_i} \sum_{r \in R_s} C_{i s r}$$

where $S_i$ is the set of reachable stops from grid $i$, $R_s$ is the set
of routes serving stop $s$, and $C_{isr}$ is the accessibility contribution
of route $r$ at stop $s$. The route contribution uses a distance-decay
function:

$$C_{i s r} = w_{i s r} \cdot \max\!\left(0,\; 1 - \frac{d_{i s}}{D_m}\right) \cdot 10$$

where $w_{isr}$ is the route weight, $d_{is}$ is the OSM-network walking
distance from grid $i$ to stop $s$, and $D_m$ is the mode-specific
catchment distance (640 m bus / 960 m rail). A closer stop gives a higher
contribution; a stop outside the catchment gives zero. Average reachability
is then aggregated to LSOA polygons for the macro-level Story and Explorer
views.

### 3.3 Disruption scenarios & the LTRS score

When the user cancels selected routes in the Network Map, the map
recalculates grid-level accessibility by removing the AI contributions of
those routes. The accessibility loss is:

$$\text{AI}_{\text{loss},\,i} = \text{AI}_{\text{baseline},\,i} - \text{AI}_{\text{disrupted},\,i}$$

and the **Local Transit Resilience Score** is:

$$\text{LTRS}_i = \frac{\text{AI}_{\text{disrupted},\,i}}{\text{AI}_{\text{baseline},\,i}} \in [0, 1]$$

A larger accessibility drop indicates weaker resilience. The lower the
LTRS value, the more vulnerable the grid is under the selected route
disruption scenario. The Network Map's split-screen renders baseline AI on
the left and the AI-loss percentage $(1 - \text{LTRS}_i)$ on the right,
with a six-step white→burgundy ramp.

The per-route, per-grid loss matrix is **pre-computed once** across all 543
routes (`route_grid_impacts_osm_network.json`, ~13 MB). At interaction time
the tool just sums losses, which is how cancelling several routes
simultaneously updates 159,000 cells in a few hundred milliseconds.

The full data-calculation pipeline (OSM walking-network extraction, per-grid
AI computation, the 543-route per-cell loss matrix and all input metadata)
is open source at
<https://github.com/Taoo2025/CASA0029/tree/main/data_calculating>.

## 4. Discussion & limitations

Despite its effectiveness, this study has several limitations due to
computational constraints. First, our model does not fully replicate the
official TfL PTAL methodology. Specifically, we did not include **frequency
attenuation** or **multi-modal transfers**, such as moving from a bus to
the Underground. Furthermore, our analysis assumes a static environment and
does not account for service changes during weekends or peak hours.

Future research could improve these calculation methods to provide a more
realistic simulation. It is also important to integrate more
socio-demographic factors, such as the **Index of Multiple Deprivation
(IMD)**. By performing an IMD overlay analysis, researchers can better
identify which vulnerable groups are most affected by transport
disruptions. This would help planners understand how transport resilience
contributes to wider social inequality in London.

## 5. References

- Chopra, S. S. et al. (2016). A network-based framework for assessing
  infrastructure resilience: a case study of the London metro system.
  *Journal of The Royal Society Interface*, 13(118), p. 20160113.
- Li, A. et al. (2025). Ease and Equity of Point of Interest Accessibility
  via Public Transit in the U.S. *arXiv*.
- Liu, Z. and Yu, Z. (2025). Transport equity assessment based on
  accessibility disparities in terms of multi-job opportunities across
  Beijing. *Scientific Reports*, 15(1), p. 30878.
