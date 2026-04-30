/**
 * @deprecated Re-export shim. Import from `../data/schema` instead.
 * Kept so a couple of dashboard / chart components keep compiling without
 * a wide refactor.
 */
export type {
  ScenarioId,
  MapMetric,
  MapMetric as MetricId,
  ResilienceMetric,
  LSOAFlatProperties,
  LSOAFlatProperties as LTISProperties,
  LSOAFeature,
  LSOAFeature as LTISFeature,
  LSOAFeatureCollection,
  LSOAFeatureCollection as LTISFeatureCollection,
  LSOAView,
  ScenarioBundle,
  BaselineBundle,
  ScenarioSummary,
  ScenarioSummaryItem,
} from "../data/schema";
