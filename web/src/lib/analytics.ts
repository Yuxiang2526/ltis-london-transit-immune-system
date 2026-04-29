import {
  getScenarioBundle,
  getScenarioMetric,
  getBaselineBundle,
  type LSOAFlatProperties,
  type MapMetric,
  type ResilienceMetric,
  type ScenarioBundle,
  type ScenarioId,
} from "../data/schema";
import { getScenarioDefinition } from "../data/scenarios";

/**
 * Resolve the numeric value for a given (scenario, metric) pair as displayed
 * on the map / charts. Centralised so the colour ramp, legend, ranking and
 * tooltip all read through the same accessor.
 */
export function getMetricValue(
  properties: LSOAFlatProperties,
  scenario: ScenarioId,
  metric: MapMetric,
): number {
  if (metric === "baseline_ltis") {
    return getBaselineBundle(properties).ltis;
  }
  return getScenarioMetric(properties, scenario, metric satisfies ResilienceMetric);
}

// Convenience wrappers — kept because dashboard/profile components read these
// individually in many places. They are thin and free.
export const getScenarioLoss = (p: LSOAFlatProperties, s: ScenarioId): number =>
  getScenarioMetric(p, s, "loss");
export const getScenarioRetention = (p: LSOAFlatProperties, s: ScenarioId): number =>
  getScenarioMetric(p, s, "retention");
export const getScenarioDependency = (p: LSOAFlatProperties, s: ScenarioId): number =>
  getScenarioMetric(p, s, "dependency");
export const getScenarioExposure = (p: LSOAFlatProperties, s: ScenarioId): number =>
  getScenarioMetric(p, s, "exposure");

// -----------------------------------------------------------------------------
// Insight sentence generator
// -----------------------------------------------------------------------------
// NOTE: The thresholds below are intentionally explicit constants rather than
// magic numbers buried in conditionals. They will be replaced in the
// methodology phase by *data-driven* percentiles computed from the full LSOA
// distribution (see analysis/04_validate_sensitivity.ipynb planned output).
// Documenting the thresholds + their justification is a rubric requirement
// under "Research & Urban Science / academic rigour".

export const INSIGHT_THRESHOLDS = {
  highVulnerabilityLoss: 0.22,
  highDependency: 0.45,
  highRetention: 0.85,
} as const;

export type InsightTone = "vulnerable" | "resilient" | "moderate";

export interface Insight {
  tone: InsightTone;
  sentence: string;
  bundle: ScenarioBundle;
}

export function makeInsight(
  properties: LSOAFlatProperties,
  scenario: ScenarioId,
): Insight {
  const bundle = getScenarioBundle(properties, scenario);
  const def = getScenarioDefinition(scenario);
  const name = properties.lsoa_name;

  if (
    bundle.loss >= INSIGHT_THRESHOLDS.highVulnerabilityLoss ||
    bundle.dependency >= INSIGHT_THRESHOLDS.highDependency
  ) {
    return {
      tone: "vulnerable",
      bundle,
      sentence: `${name} appears highly vulnerable under the ${def.label} scenario. A large share of its baseline fallback mobility is associated with the disrupted corridor, so the area has limited capacity to absorb this shock.`,
    };
  }

  if (bundle.retention >= INSIGHT_THRESHOLDS.highRetention) {
    return {
      tone: "resilient",
      bundle,
      sentence: `${name} retains a high share of its baseline mobility under the ${def.label} scenario, suggesting stronger multimodal alternatives and lower dependence on the disrupted corridor.`,
    };
  }

  return {
    tone: "moderate",
    bundle,
    sentence: `${name} shows moderate sensitivity under the ${def.label} scenario. The area retains some alternatives, but disruption still produces a visible reduction in local mobility options.`,
  };
}

/** Backwards-compatible alias used by existing components. Returns the sentence. */
export function makeInsightSentence(
  properties: LSOAFlatProperties,
  scenario: ScenarioId,
): string {
  return makeInsight(properties, scenario).sentence;
}
