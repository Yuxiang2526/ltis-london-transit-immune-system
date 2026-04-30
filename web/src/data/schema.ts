/**
 * LTIS data schema
 * ----------------
 * Two layers, intentionally separated:
 *
 *   1. Storage layer (LSOAFlatProperties)
 *      Flat key-value shape that lives inside GeoJSON `feature.properties`.
 *      Stays flat because MapLibre paint expressions (`["get", "99_loss"]`)
 *      can only address top-level keys efficiently.
 *
 *   2. Logical layer (LSOAView, ScenarioBundle)
 *      Ergonomic nested shape used by React components. Built on demand from
 *      the flat layer via accessor helpers — never serialised back to disk.
 *
 * Adding a new disruption scenario:
 *   - append its id + label to SCENARIO_REGISTRY in features/scenarios.ts
 *   - ensure the corresponding flat keys exist in the source GeoJSON
 *   - no type changes required here
 */

// -----------------------------------------------------------------------------
// Scenario + metric vocabulary
// -----------------------------------------------------------------------------

/** Open scenario id. Concrete ids live in the SCENARIO_REGISTRY, not the type. */
export type ScenarioId = string;

/** Resilience indicators computed per-scenario relative to baseline. */
export const RESILIENCE_METRICS = [
  "retention",
  "loss",
  "exposure",
  "dependency",
] as const;
export type ResilienceMetric = (typeof RESILIENCE_METRICS)[number];

/** Map metric usable in choropleth — extends ResilienceMetric with baseline. */
export type MapMetric = "baseline_ltis" | ResilienceMetric;

// -----------------------------------------------------------------------------
// Storage layer — flat keys living in GeoJSON properties
// -----------------------------------------------------------------------------

/**
 * Required identity + context fields. Always present.
 * `lsoa_*` keep snake_case to match upstream ONS / data.london.gov.uk naming.
 */
export interface LSOAIdentity {
  lsoa_code: string;
  lsoa_name: string;
  borough: string;
  population: number;
  imd_decile?: number; // 1 = most deprived, 10 = least. Optional until joined.
}

/** Baseline (no-disruption) indicators. */
export interface LSOABaseline {
  baseline_ltis: number;
  ptal_mean?: number;
  ptal_norm?: number;
  stop_supply?: number;
  mode_diversity?: number;
  micro_mobility?: number;
}

/**
 * Per-scenario flat keys. Convention: `{scenarioId}_{field}`.
 * The accessor `getScenarioBundle` turns this into a nested ScenarioBundle.
 *
 * Example (scenarioId = "99"):
 *   99_score, 99_retention, 99_loss, 99_exposure, 99_dependency
 */
export type LSOAScenarioFlatKey<S extends string, F extends string> = `${S}_${F}`;

/** Categorical labels often joined upstream. */
export interface LSOACategorical {
  vulnerability_class?: string;
  dominant_dependency?: string;
}

/**
 * Full storage shape. Scenario-specific fields are typed loosely as a string-
 * keyed numeric map because their key names depend on the scenario registry.
 * Use `getScenarioMetric` / `getScenarioBundle` instead of indexing directly.
 */
export type LSOAFlatProperties = LSOAIdentity &
  LSOABaseline &
  LSOACategorical & {
    [key: string]: string | number | undefined;
  };

// -----------------------------------------------------------------------------
// Logical layer — nested view used by UI
// -----------------------------------------------------------------------------

export interface ScenarioBundle {
  scenarioId: ScenarioId;
  /** Disrupted absolute score for this scenario. */
  ltis: number;
  retention: number;
  loss: number;
  exposure: number;
  dependency: number;
}

export interface BaselineBundle {
  ltis: number;
  ptalMean: number | null;
  ptalNorm: number | null;
  stopSupply: number | null;
  modeDiversity: number | null;
  microMobility: number | null;
}

export interface LSOAView {
  identity: LSOAIdentity;
  baseline: BaselineBundle;
  scenario: (id: ScenarioId) => ScenarioBundle;
  raw: LSOAFlatProperties;
}

// -----------------------------------------------------------------------------
// GeoJSON wrappers
// -----------------------------------------------------------------------------

export interface LSOAFeature {
  type: "Feature";
  properties: LSOAFlatProperties;
  geometry: GeoJSONGeometry;
}

export interface LSOAFeatureCollection {
  type: "FeatureCollection";
  features: LSOAFeature[];
}

/** Minimal GeoJSON geometry union — avoids pulling @types/geojson for now. */
export type GeoJSONGeometry =
  | { type: "Polygon"; coordinates: number[][][] }
  | { type: "MultiPolygon"; coordinates: number[][][][] };

// -----------------------------------------------------------------------------
// Scenario summary (loaded from scenario_summary.json)
// -----------------------------------------------------------------------------

export interface ScenarioSummaryItem {
  label: string;
  description: string;
  meanRetention: number;
  meanLoss: number;
  totalExposedPopulation: number;
  mostAffectedBoroughs: { borough: string; meanLoss: number }[];
}

export type ScenarioSummary = Record<ScenarioId, ScenarioSummaryItem>;

// -----------------------------------------------------------------------------
// Accessors — single source of truth for reading flat properties
// -----------------------------------------------------------------------------

const num = (value: unknown, fallback = 0): number =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;

const numOrNull = (value: unknown): number | null =>
  typeof value === "number" && Number.isFinite(value) ? value : null;

export function flatKey(scenario: ScenarioId, field: string): string {
  return `${scenario}_${field}`;
}

export function getScenarioMetric(
  properties: LSOAFlatProperties,
  scenario: ScenarioId,
  metric: ResilienceMetric,
): number {
  return num(properties[flatKey(scenario, metric)]);
}

export function getScenarioBundle(
  properties: LSOAFlatProperties,
  scenario: ScenarioId,
): ScenarioBundle {
  // The `*_score` flat key is the convention used by the demo pipeline for
  // the disrupted absolute score; future pipelines may emit `*_ltis` directly.
  const ltis = num(
    properties[flatKey(scenario, "score")] ?? properties[flatKey(scenario, "ltis")],
  );
  const loss = getScenarioMetric(properties, scenario, "loss");
  // Retention semantics: SHARE of baseline accessibility retained = 1 - loss.
  // The flat `*_retention` field in lsoa_ltis.geojson currently stores the
  // absolute disrupted score (mislabel from the demo pipeline) — we derive
  // the correct retention value from `*_loss` instead so every page agrees
  // with the methodology page's LTRS definition (LTRS = AI_disrupted /
  // AI_baseline = 1 − loss-share).
  const retention = Math.max(0, Math.min(1, 1 - loss));
  return {
    scenarioId: scenario,
    ltis,
    retention,
    loss,
    exposure: getScenarioMetric(properties, scenario, "exposure"),
    dependency: getScenarioMetric(properties, scenario, "dependency"),
  };
}

export function getBaselineBundle(properties: LSOAFlatProperties): BaselineBundle {
  return {
    ltis: num(properties.baseline_ltis),
    ptalMean: numOrNull(properties.ptal_mean),
    ptalNorm: numOrNull(properties.ptal_norm),
    stopSupply: numOrNull(properties.stop_supply),
    modeDiversity: numOrNull(properties.mode_diversity),
    microMobility: numOrNull(properties.micro_mobility),
  };
}

export function toLSOAView(properties: LSOAFlatProperties): LSOAView {
  return {
    identity: {
      lsoa_code: properties.lsoa_code,
      lsoa_name: properties.lsoa_name,
      borough: properties.borough,
      population: num(properties.population),
      imd_decile: numOrNull(properties.imd_decile) ?? undefined,
    },
    baseline: getBaselineBundle(properties),
    scenario: (id) => getScenarioBundle(properties, id),
    raw: properties,
  };
}

/** Map metric resolver — returns the flat key MapLibre will `["get", ...]`. */
export function resolveMapPropertyName(
  scenario: ScenarioId,
  metric: MapMetric,
): string {
  return metric === "baseline_ltis" ? "baseline_ltis" : flatKey(scenario, metric);
}
