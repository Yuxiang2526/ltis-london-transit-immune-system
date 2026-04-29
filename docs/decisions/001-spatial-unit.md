# ADR 001 — Spatial unit: LSOA over PTAL grid and hex

**Status**: Accepted
**Date**: 2026-04
**Decision-makers**: Yuxiang Fan, Siyan Tao

## Context

The opening presentation kept three candidate spatial units open: **PTAL grid** (100 m squares as published by TfL), **LSOA 2021** (~1,500 residents per polygon), and **hex grid** (e.g. H3 resolution 8). The choice affects both analytical validity (how cleanly population, accessibility and disruption indicators can be joined) and visual legibility (how much detail the choropleth can carry without becoming illegible at city scale).

## Decision

Use **LSOA 2021** as the primary spatial unit for the LTIS choropleth and as the join key for population, IMD and PTAL aggregates.

## Reasoning

1. **Joinability with population and equity data.** The ONS publishes mid-year population estimates and IMD scores natively at LSOA. PTAL grid joins to LSOA via area-weighted aggregation; the reverse is much messier. This drives "exposure = loss × population" cleanly.
2. **Editorial recognisability.** LSOA names are recognisable to a London-literate audience ("Tower Hamlets 014A" reads as a place; H3 hex `8a194ad32987fff` does not).
3. **Visual density at city scale.** ~4,800 LSOAs across Greater London is the right grain for a single-screen choropleth: enough resolution to expose intra-borough variation, sparse enough to read at z=9.
4. **Reproducibility.** The LSOA boundaries are stable across releases; H3 hex would force us to publish our own resolution choice and re-aggregate everything.

## Consequences

- We accept the **modifiable areal unit problem (MAUP)** — the LSOA boundary is a statistical artefact, not a behavioural unit. The methodology page will state this explicitly.
- We accept that **PTAL aggregation to LSOA introduces blur** versus the native 100 m grid. We mitigate by reporting both `ptal_mean` and `ptal_norm` at LSOA level and providing the original grid for inspection on the methodology page.
- We forgo the visual elegance of hex; we may revisit hex specifically for the *small-multiples comparison view* if LSOA polygons prove too noisy at thumbnail scale.

## Alternatives considered

- **PTAL grid native**: rejected because population / IMD joins become lossy and the visual is too noisy at city scale.
- **MSOA (one level coarser)**: rejected because intra-borough variation is the analytical story; MSOA hides it.
- **H3 hex**: rejected for editorial reasons (see #2) and reproducibility (see #4).
