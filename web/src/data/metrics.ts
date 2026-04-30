import type { MapMetric } from "./schema";

export type MetricDirection = "higherBetter" | "higherWorse" | "neutral";
export type MetricUnit = "score" | "percent" | "people";

export interface MetricDefinition {
  id: MapMetric;
  label: string;
  shortLabel: string;
  description: string;
  legendTitle: string;
  direction: MetricDirection;
  unit: MetricUnit;
  /**
   * Suggested colour ramp role:
   *   - sequential: 0 → high (one direction)
   *   - diverging: meaningful midpoint (e.g. baseline-vs-scenario delta)
   */
  rampRole: "sequential" | "diverging";
}

export const METRIC_REGISTRY: Record<MapMetric, MetricDefinition> = {
  baseline_ltis: {
    id: "baseline_ltis",
    label: "Baseline LTIS",
    shortLabel: "Baseline",
    description: "Healthy-condition local mobility score derived from PTAL, stop supply and modal diversity.",
    legendTitle: "Baseline LTIS score",
    direction: "higherBetter",
    unit: "score",
    rampRole: "sequential",
  },
  retention: {
    id: "retention",
    label: "Retained mobility",
    shortLabel: "Retention",
    description: "Share of baseline mobility retained under the selected disruption scenario.",
    legendTitle: "Retained mobility",
    direction: "higherBetter",
    unit: "percent",
    rampRole: "sequential",
  },
  loss: {
    id: "loss",
    label: "Accessibility loss",
    shortLabel: "Loss",
    description: "Estimated reduction in local fallback mobility under the selected disruption scenario.",
    legendTitle: "Accessibility loss",
    direction: "higherWorse",
    unit: "score",
    rampRole: "sequential",
  },
  exposure: {
    id: "exposure",
    label: "Population exposure",
    shortLabel: "Exposure",
    description: "Accessibility loss weighted by local population.",
    legendTitle: "Population exposure",
    direction: "higherWorse",
    unit: "people",
    rampRole: "sequential",
  },
  dependency: {
    id: "dependency",
    label: "Line dependency",
    shortLabel: "Dependency",
    description: "Estimated share of baseline mobility dependent on the disrupted corridor.",
    legendTitle: "Dependency on disrupted line",
    direction: "higherWorse",
    unit: "percent",
    rampRole: "sequential",
  },
};

export const ALL_MAP_METRICS: MapMetric[] = Object.keys(METRIC_REGISTRY) as MapMetric[];

export const DEFAULT_MAP_METRIC: MapMetric = "baseline_ltis";

export function getMetricDefinition(id: MapMetric): MetricDefinition {
  const def = METRIC_REGISTRY[id];
  if (!def) {
    throw new Error(`Unknown map metric: ${id}`);
  }
  return def;
}
