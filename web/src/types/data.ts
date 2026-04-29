/**
 * @deprecated Re-export shim. Import from `../data/schema` instead.
 * Kept temporarily so existing components keep compiling during the D2
 * features/ reorganisation. Will be removed after D2 lands.
 */
export type {
  ScenarioId,
  MapMetric,
  MapMetric as MetricId,
  ResilienceMetric,
  FallbackProfile,
  FallbackDimension,
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
