/**
 * @deprecated Re-export shim. Import from `../data/scenarios` instead.
 * Existing components depend on the `SCENARIOS` name + Record shape; we keep
 * that surface here while the new code uses `SCENARIO_REGISTRY` directly.
 */
export {
  SCENARIO_REGISTRY as SCENARIOS,
  SCENARIO_REGISTRY,
  ALL_SCENARIO_IDS,
  DEFAULT_SCENARIO_ID,
  getScenarioDefinition,
} from "../data/scenarios";

export type { ScenarioDefinition } from "../data/scenarios";
