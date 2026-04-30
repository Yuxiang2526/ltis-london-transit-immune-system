# LTRS — Project Methodology Summary

> CASA0029 Urban Data Visualisation, Group 17 (Yuxiang Fan, Siyan Tao)
> Target length: ~1,000 words. **Status: skeleton — sections marked _[draft]_ are placeholders that the data-pipeline phase will tighten.**

## 1. Research question

How unevenly is transport resilience distributed across London, and how do disruptions expose differences in local transport substitutability?

LTRS treats line disruption as a stress test on the transport network. It asks not just *where* disruption happens, but *which neighbourhoods still have alternatives* — and which become sharply more vulnerable. The unit of analysis is the **2021 LSOA** (Lower-layer Super Output Area), and the spatial extent is Greater London.

## 2. Conceptual framework

We adopt a **single-step impact-based** definition of resilience: the share of baseline accessibility a place retains when a specific corridor fails (Jenelius 2010; D'Lima & Medda 2016). This narrows the broader resilience literature — which spans temporal recovery (Bruneau et al. 2003; Henry & Ramirez-Marquez 2012) and topological robustness (Derrible & Kennedy 2010; Cats 2016) — to a measure that is computable from open static data and decomposes naturally to neighbourhoods. The trade-off is documented in [ADR 002](decisions/002-resilience-definition.md): we measure spatial *vulnerability under disruption*, not full time-domain *resilience*.

The framework runs in three stages:

1. **Healthy baseline** — a per-LSOA Local Transport Resilience Score (LTRS) combining PTAL, NaPTAN-derived stop supply, modal diversity and a small micro-mobility component.
2. **Inject disruption** — for each pre-defined scenario (Central, Northern, Jubilee line failures), we recompute accessibility with the affected line removed.
3. **Resilience response** — we compare baseline against disrupted state, producing four indicators per LSOA per scenario: **retention**, **loss**, **dependency** and **population exposure**.

## 3. Data sources

The full data manifest, including URLs, vintages and licences, is in [`data/DATA_SOURCES.md`](../data/DATA_SOURCES.md). Headline sources:

- **LSOA 2021 boundaries + mid-year population** (ONS, OGL v3) — spatial unit and exposure denominator.
- **PTAL grid 2015** (TfL via WebCAT, TfL Open Data licence) — baseline accessibility component. The 11-year vintage is the most significant data limitation; we discuss its bias in §6.
- **NaPTAN** (DfT, OGL v3) — locations of every Tube station, bus stop, DLR / Elizabeth line / Overground access node. Drives stop supply and modal diversity.
- **TfL line and station geometry** (TfL Open Data licence) — used both for the "disrupted line" overlay on the map and for identifying which LSOAs sit within a line's catchment.
- **English Indices of Multiple Deprivation 2019** (MHCLG, OGL v3) — used for the equity-weighted exposure secondary metric.
- **OS Open Roads** (OS, OGL v3) — supports walking and cycling fallback estimation.

## 4. Methods

### 4.1 Spatial unit

LSOA over PTAL grid or hex — full reasoning in [ADR 001](decisions/001-spatial-unit.md). PTAL grid values are area-weighted to LSOA; NaPTAN points are aggregated to LSOA via point-in-polygon.

### 4.2 Baseline LTRS

For each LSOA *i*:

```
LTRS_baseline(i) = w₁ · ptal_norm(i)
                 + w₂ · stop_supply_norm(i)
                 + w₃ · mode_diversity(i)
                 + w₄ · micro_mobility(i)
```

with weights `w₁..w₄` summing to 1. Initial weights are equal (0.25 each); a sensitivity sweep over the weight simplex is reported in `analysis/04_validate_sensitivity.ipynb`.

- `ptal_norm` is the LSOA-level PTAL aggregate normalised to [0,1].
- `stop_supply_norm` is NaPTAN stops per km² per LSOA, log-transformed and normalised.
- `mode_diversity` is Shannon diversity over NaPTAN stop modes (Tube, bus, rail, DLR, light rail, tram).
- `micro_mobility` is a supplementary factor combining cycle network density (OS Open Roads) and Santander Cycles dock proximity.

### 4.3 Disruption simulation

For each scenario *s* (a single Tube line `l_s`):

1. Identify the **catchment** of the line — LSOAs that contain or are within walking distance (default 800 m) of any station served by `l_s`.
2. Recompute the modal-diversity and stop-supply terms with `l_s` stations removed; recompute LTRS.
3. Derive per-LSOA indicators:
   - `retention(i, s) = LTRS_disrupted(i, s) / LTRS_baseline(i)`
   - `loss(i, s) = max(0, 1 − retention(i, s))`
   - `dependency(i, s)` — the fraction of `LTRS_baseline(i)` attributable to `l_s`, measured by the impact of its removal (Jenelius 2010).
   - `exposure(i, s) = loss(i, s) × population(i)`

### 4.4 Local fallback profile

For each LSOA + scenario, the website also exposes a **5-dimension fallback profile** (cf. presentation slide 11):

- *Redundancy* — count of alternative non-`l_s` lines / modes serving the LSOA's catchment.
- *Bus fallback* — share of trips covered by bus given `l_s` removal (NaPTAN bus density × catchment overlap).
- *Cycle fallback* — supplementary, derived from OS Open Roads and Santander dock density.
- *Modal diversity* — Shannon diversity of remaining modes.
- *Dependency risk* — `1 − retention(i, s)`, included on the radar so dependency is visible in profile context.

## 5. Visualisation strategy

The website is structured as a **scrollytelling story** (Hero → Healthy Baseline → Inject Disruption → Immune Response) followed by an **explorer dashboard** (interactive choropleth + side-by-side small-multiples comparison + ranking + local profile). Visualisation types are matched to data types: choropleth for spatial intensity, small multiples for cross-scenario comparison, radar for the 5-dimension fallback profile, beeswarm/Lorenz for distributional inequality, and a sensitivity strip for robustness. The colour strategy is documented in [ADR 003](decisions/003-color-strategy.md).

## 6. Limitations and caveats

- **PTAL vintage (2015)** systematically under-represents post-2015 step changes (Elizabeth line corridor; Northern line Battersea extension). LTRS treats these areas as less-served than they really are.
- **PTAL only counts public transport** — areas where commuting is dominated by cycling, walking or motoring will appear less resilient than residents would report.
- **Static, single-step.** We do not model recovery time, cascading effects, or capacity-constrained crowding on substitute lines.
- **Population exposure is unweighted** in the headline metric. An equity-weighted secondary metric (loss × population × IMD-inverse) is reported separately so the metric trade-off is visible.
- **Modifiable Areal Unit Problem (MAUP)** — LSOAs are statistical, not behavioural. Conclusions are sensitive to the boundary geometry.

## 7. Reproducibility

All code is in this repository under MIT licence. The Python pipeline (`analysis/`) downloads raw data, produces processed GeoJSON / JSON, and is fully re-runnable from a clean environment via `uv sync && jupyter lab`. The frontend (`web/`) is a static build; deployed to GitHub Pages from the `main` branch via the workflow at `.github/workflows/deploy.yml`.

## 8. AI-tool usage

AI assistance was used during development as itemised in [`submission/Group17_Project_Info.md`](../submission/Group17_Project_Info.md). All conceptual framing, data interpretation, methodology decisions and final wording are the authors'; AI assistance was used for code scaffolding and copy editing.

## References

- Bruneau, M. et al. (2003). *A framework to quantitatively assess and enhance the seismic resilience of communities.* Earthquake Spectra 19(4): 733–752.
- Cats, O. (2016). *The robustness value of public transport development plans.* Journal of Transport Geography 51: 236–246.
- Chopra, S. S. et al. (2016). *A network-based framework for assessing infrastructure resilience: a case study of the London metro system.* Journal of the Royal Society Interface 13(118).
- Cox, A., Prager, F., & Rose, A. (2011). *Transportation security and the role of resilience: a foundation for operational metrics.* Transport Policy 18(2): 307–317.
- Derrible, S. & Kennedy, C. (2010). *The complexity and robustness of metro networks.* Physica A 389: 3678–3691.
- D'Lima, M. & Medda, F. (2016). *A new measure of resilience: an application to the London Underground.* Transportation Research Part A 81: 35–46.
- Henry, D. & Ramirez-Marquez, J. E. (2012). *Generic metrics and quantitative approaches for system resilience as a function of time.* Reliability Engineering & System Safety 99: 114–122.
- Jenelius, E. (2010). *Redundancy importance: links as rerouting alternatives during road network disruptions.* Procedia Engineering 3: 129–137.
- Sharma, D., Zhong, C., & Wong, H. (2024). *Lockdown lifted: measuring spatial resilience from London's public transport demand recovery.* Regional Studies, Regional Science 11.
