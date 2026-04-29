import type { ScenarioId } from "./schema";

export interface ScenarioDefinition {
  id: ScenarioId;
  label: string;
  shortLabel: string;
  /** Editorial description shown in selectors and methodology. */
  description: string;
  /** Hex colour used for the line geometry overlay on the map. */
  lineColor: string;
  /** Optional citation key into data/references.ts (e.g. TfL line page). */
  referenceKey?: string;
}

/**
 * Open registry of disruption scenarios.
 *
 * To add a new scenario:
 *   1. Append an entry below.
 *   2. Ensure the source GeoJSON contains the corresponding `{id}_*` flat keys
 *      (see schema.ts: `flatKey`).
 *   3. Add a matching entry in `scenario_summary.json`.
 *
 * The `id` should match the snake_case prefix used in the GeoJSON properties.
 */
export const SCENARIO_REGISTRY: Record<ScenarioId, ScenarioDefinition> = {
  central: {
    id: "central",
    label: "Central line disruption",
    shortLabel: "Central",
    description:
      "An east-west corridor disruption used to inspect dependency on the Central line and the resilience of fallback mobility along its catchment.",
    lineColor: "#ee2724",
  },
  northern: {
    id: "northern",
    label: "Northern line disruption",
    shortLabel: "Northern",
    description:
      "A branched north-south corridor disruption used to inspect outer-borough vulnerability where fallback alternatives thin out.",
    lineColor: "#000000",
  },
  jubilee: {
    id: "jubilee",
    label: "Jubilee line disruption",
    shortLabel: "Jubilee",
    description:
      "A northwest-central-east corridor disruption used to inspect resilience along high-density employment axes.",
    lineColor: "#a1a5a7",
  },
};

export const ALL_SCENARIO_IDS: ScenarioId[] = Object.keys(SCENARIO_REGISTRY);

export const DEFAULT_SCENARIO_ID: ScenarioId = "central";

export function getScenarioDefinition(id: ScenarioId): ScenarioDefinition {
  const def = SCENARIO_REGISTRY[id];
  if (!def) {
    throw new Error(`Unknown scenario id: ${id}`);
  }
  return def;
}
