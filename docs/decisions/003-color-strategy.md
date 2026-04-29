# ADR 003 — Colour strategy: dual-ramp, perceptually-uniform, colour-blind-safe

**Status**: Accepted
**Date**: 2026-04
**Decision-makers**: Yuxiang Fan, Siyan Tao

## Context

LTIS uses two semantic families of metrics:

- **"Higher is better"** — `baseline_ltis`, `retention`. These are good news; warm/red would mislead.
- **"Higher is worse"** — `loss`, `dependency`, `exposure`. These are vulnerability metrics; cool/blue would mislead.

A single ramp cannot serve both. We must also reckon with: deuteranopia / protanopia (~8% of male readers), low-end mobile screens (sRGB clipping in deep blues), and the fact that the page is dark-themed (which inverts contrast expectations from typical print cartography).

## Decision

Use **two complementary sequential ramps**, encoded as a single source of truth in `web/src/lib/mapExpressions.ts`. The map paint expression and the legend gradient both derive from the same stops object. The ramps are:

1. **`RAMP_RESILIENT_COOL`** — deep purple → blue → teal → mint green, used for higher-is-better metrics.
2. **`RAMP_VULNERABLE_WARM`** — near-black → muted purple → amber → orange → red, used for higher-is-worse metrics.

A third planned ramp, **`RAMP_DIVERGING`** (RdBu-style), will be introduced for explicit *baseline-vs-scenario delta* views in the side-by-side comparison panel.

## Reasoning

1. **Semantic colour-direction matching.** Mapping "good" to cool and "bad" to warm aligns with the dominant cartographic convention (ColorBrewer sequential ramps and Stevens et al. 2017 perception studies). Inverting this would force readers to fight the encoding.
2. **Single source of truth.** The earlier prototype hard-coded the legend ticks separately from the paint expression in `MapLegend.tsx` and `mapExpressions.ts`. This is a correctness hazard. The new `getPaintConfig()` returns both.
3. **Perceptual uniformity.** The candidate stops are tuned against viridis/magma-style luminance progressions, so equal value-deltas read as roughly equal colour-deltas in dark mode.
4. **Colour-blind safety.** The cool ramp avoids red entirely; the warm ramp uses amber (visible to deuteranopia) rather than green-red contrast. We will validate against `Coblis` simulations before the final submission.

## Consequences

- All new map metrics MUST declare a `rampRole` (`"sequential"` or `"diverging"`) in `data/metrics.ts`. The map module will refuse metrics without one.
- Legend ticks are auto-derived from the ramp stops; designers cannot drift away from the encoded scale.
- A future shift to data-driven quantile breaks (rather than hand-tuned stops) is now a one-function change in `mapExpressions.ts` — components do not need to know.

## References

- Stevens, J. E. et al. (2017). *Mapping with categorical colour: a perceptual study*. Cartography and Geographic Information Science 44(2).
- Brewer, C. A. *ColorBrewer 2.0*. https://colorbrewer2.org
- Crameri, F. (2018). *Geodynamic diagnostics, scientific visualisation and StagLab 3.0*. Geosci. Model Dev. 11.
