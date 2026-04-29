# ADR 002 — Resilience operationalised as retained mobility (single-step)

**Status**: Accepted
**Date**: 2026-04
**Decision-makers**: Yuxiang Fan, Siyan Tao

## Context

The transport-resilience literature distinguishes at least three families of operational definitions:

1. **Time-recovery** — the integral of the system's performance gap during disruption and recovery (Bruneau et al. 2003, Henry & Ramirez-Marquez 2012). Requires a temporal trajectory.
2. **Topological** — graph-theoretic measures of redundancy and substitutability (Derrible & Kennedy 2010, Cats 2016).
3. **Static impact-based** — single-step counterfactual: "what fraction of accessibility is preserved if link/line *l* fails?" (Jenelius 2010, D'Lima & Medda 2016).

LTIS needs a definition that (a) is computable from open static data, (b) is intelligible to a general audience, (c) decomposes spatially to LSOA, and (d) can be calculated in a 2-person, ~6-week window.

## Decision

LTIS operationalises **resilience as static, impact-based retained mobility**:

```
retention(i, l) = LTIS_disrupted(i, l) / LTIS_baseline(i)
loss(i, l)      = max(0, 1 - retention(i, l))
dependency(i, l) ≈ contribution of line l to baseline LTIS at i
exposure(i, l)  = loss(i, l) × population(i)
```

where `i` indexes LSOAs and `l` indexes the disrupted line.

## Reasoning

1. **Open-data feasible.** All inputs are computable from PTAL (or PTAL-like accessibility), NaPTAN stop locations, and LSOA population. No need for time-resolved smartcard or AVL data.
2. **Editorial intelligibility.** "73% of mobility retained" lands with a general audience; "area under the resilience triangle" does not.
3. **Spatial decomposition.** The single-step counterfactual is naturally per-LSOA, which is exactly the unit our choropleth uses.

## Consequences

- We **explicitly forgo the temporal component**. We are measuring *vulnerability* in the strict literature sense, not *resilience*. The website and methodology page must state this — the metaphor "immune system" is editorial framing, not the technical claim.
- The **dependency** indicator is approximate. We compute it as the share of baseline accessibility lost when the line is removed (Jenelius 2010-style impact), not via path-redundancy graph metrics (Derrible & Kennedy 2010). The methodology page documents the approximation.
- Equity-weighted variants (`exposure × IMD_inverse`) are reported as a secondary metric, not the headline.

## References

- Bruneau, M. et al. (2003). *A framework to quantitatively assess and enhance the seismic resilience of communities*. Earthquake Spectra 19(4): 733–752.
- Cats, O. (2016). *The robustness value of public transport development plans*. Journal of Transport Geography 51: 236–246.
- D'Lima, M. & Medda, F. (2016). *A new measure of resilience: An application to the London Underground*. Transportation Research Part A 81: 35–46.
- Derrible, S. & Kennedy, C. (2010). *The complexity and robustness of metro networks*. Physica A 389: 3678–3691.
- Henry, D. & Ramirez-Marquez, J. E. (2012). *Generic metrics and quantitative approaches for system resilience as a function of time*. Reliability Engineering & System Safety 99: 114–122.
- Jenelius, E. (2010). *Redundancy importance: Links as rerouting alternatives during road network disruptions*. Procedia Engineering 3: 129–137.
