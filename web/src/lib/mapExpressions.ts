import {
  resolveMapPropertyName,
  type MapMetric,
  type ScenarioId,
} from "../data/schema";
import { getMetricDefinition } from "../data/metrics";

/**
 * Map paint configuration. Single source of truth shared by:
 *   - LTISMap (paint expression)
 *   - MapLegend (gradient + tick labels)
 *
 * Stops are quoted as [domainValue, colour] pairs and converted to MapLibre
 * `interpolate` expressions on demand. Switching to a perceptually-uniform
 * ramp (viridis / magma) is a one-line change here.
 *
 * NOTE: domain stops are still hand-tuned. They will be replaced by
 * data-driven quantiles computed from the actual LSOA distribution once the
 * real pipeline lands (see analysis/02_compute_baseline_ltis.ipynb).
 */

export type ColorStop = readonly [value: number, color: string];

/**
 * Cool sequential ramp — pale → deep navy.
 * Mirrors the project palette's blue arm. Used for higher-is-better metrics
 * that should NOT use the diverging treatment (e.g. retention).
 */
const RAMP_RESILIENT_COOL: readonly ColorStop[] = [
  [0.0,  "#e9f1f4"], // palette-blue-5
  [0.4,  "#b6d7e8"], // palette-blue-4
  [0.55, "#6dadd1"], // palette-blue-3
  [0.7,  "#317cb7"], // palette-blue-2
  [0.85, "#104680"], // palette-blue-1
];

/**
 * Diverging RdBu ramp for the baseline LTIS percentile rank in [0, 1].
 * Low percentile (least-accessible LSOAs) → cool deep blue;
 * Median (0.5)                            → neutral pale;
 * High percentile (most-accessible LSOAs) → warm burgundy.
 *
 * Matches the 10-step project palette used by the Impact Matrix and the
 * Decile Bars, so the Story / Explorer choropleth, the matrix heatmap,
 * and the decile bar chart all read as the SAME colour language.
 */
const RAMP_BASELINE_DIVERGING: readonly ColorStop[] = [
  [0.0,  "#104680"], // palette-blue-1   — least accessible
  [0.25, "#6dade1"], // palette-blue-3
  [0.5,  "#e9f1f4"], // palette-blue-5   — neutral midpoint
  [0.75, "#dc6d57"], // palette-red-3
  [1.0,  "#6d011f"], // palette-red-5   — most accessible
];

/**
 * Warm sequential ramp — cream → burgundy.
 * Mirrors the project palette's red arm. Used for higher-is-worse metrics in
 * the [0, 1] range (loss, dependency).
 */
const RAMP_VULNERABLE_WARM: readonly ColorStop[] = [
  [0.0, "#fbe3d5"], // palette-red-1
  [0.1, "#f6b293"], // palette-red-2
  [0.2, "#dc6d57"], // palette-red-3
  [0.3, "#b72230"], // palette-red-4
  [0.4, "#6d011f"], // palette-red-5
];

/** Same warm ramp re-domained for population exposure (people, not [0,1]). */
const RAMP_EXPOSURE: readonly ColorStop[] = [
  [0,   "#fbe3d5"],
  [100, "#f6b293"],
  [300, "#dc6d57"],
  [600, "#b72230"],
  [900, "#6d011f"],
];

const FALLBACK_RAMP: readonly ColorStop[] = [
  [0, "#eaeef3"],
  [1, "#eaeef3"],
];

export interface PaintConfig {
  /** Property name MapLibre will look up via `["get", propertyName]`. */
  propertyName: string;
  /** Stops driving both the paint expression and the legend gradient. */
  stops: readonly ColorStop[];
  /** Pre-formatted tick labels for the legend (matches stops 1:1). */
  legendTicks: string[];
  /** True if the metric ramp is "higher = worse" (warm). */
  isVulnerabilityRamp: boolean;
}

function chooseRamp(metric: MapMetric): readonly ColorStop[] {
  switch (metric) {
    case "baseline_ltis":
      return RAMP_BASELINE_DIVERGING;
    case "retention":
      return RAMP_RESILIENT_COOL;
    case "loss":
    case "dependency":
      return RAMP_VULNERABLE_WARM;
    case "exposure":
      return RAMP_EXPOSURE;
    default:
      return FALLBACK_RAMP;
  }
}

function formatTick(metric: MapMetric, value: number, isLast: boolean): string {
  const def = getMetricDefinition(metric);
  const suffix = isLast ? "+" : "";
  if (def.unit === "people") {
    return `${value}${suffix}`;
  }
  if (def.unit === "percent") {
    return `${Math.round(value * 100)}%${suffix}`;
  }
  return `${value.toFixed(2)}${suffix}`;
}

export function getPaintConfig(scenario: ScenarioId, metric: MapMetric): PaintConfig {
  const stops = chooseRamp(metric);
  return {
    propertyName: resolveMapPropertyName(scenario, metric),
    stops,
    legendTicks: stops.map(([v], i) => formatTick(metric, v, i === stops.length - 1)),
    isVulnerabilityRamp:
      metric === "loss" || metric === "dependency" || metric === "exposure",
  };
}

/**
 * MapLibre paint expression for the choropleth fill.
 * Returns an `unknown[]` because the maplibre-gl type union for expressions is
 * heavy and not worth importing for a skeleton — the runtime checker validates
 * it for us. Cast at the call site with `as never`.
 */
export function buildFillColorExpression(config: PaintConfig): unknown[] {
  const interpolate: unknown[] = [
    "interpolate",
    ["linear"],
    ["to-number", ["get", config.propertyName], 0],
  ];
  for (const [value, color] of config.stops) {
    interpolate.push(value, color);
  }
  return interpolate;
}

/** Convenience: combine paint config + expression for callers that want both. */
export function getMapPaint(scenario: ScenarioId, metric: MapMetric): {
  config: PaintConfig;
  expression: unknown[];
} {
  const config = getPaintConfig(scenario, metric);
  return { config, expression: buildFillColorExpression(config) };
}

// -----------------------------------------------------------------------------
// Backwards-compatible exports used by existing components.
// -----------------------------------------------------------------------------

export function getPropertyName(scenario: ScenarioId, metric: MapMetric): string {
  return resolveMapPropertyName(scenario, metric);
}

/** @deprecated use buildFillColorExpression(getPaintConfig(...)) */
export function getFillColorExpression(
  scenario: ScenarioId,
  metric: MapMetric,
): unknown[] {
  return buildFillColorExpression(getPaintConfig(scenario, metric));
}

/** Linear-gradient CSS string for the legend swatch. */
export function getLegendGradient(config: PaintConfig): string {
  const colors = config.stops.map(([, c]) => c).join(", ");
  return `linear-gradient(90deg, ${colors})`;
}
