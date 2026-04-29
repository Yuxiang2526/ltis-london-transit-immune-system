/**
 * @deprecated Re-export shim. Import from `../data/metrics` instead.
 * Existing components consume `METRICS` keyed by metric id; we proxy to the
 * new `METRIC_REGISTRY` and re-export the new factory helpers.
 */
export {
  METRIC_REGISTRY as METRICS,
  METRIC_REGISTRY,
  ALL_MAP_METRICS,
  DEFAULT_MAP_METRIC,
  getMetricDefinition,
} from "../data/metrics";

export type { MetricDefinition, MetricDirection, MetricUnit } from "../data/metrics";
