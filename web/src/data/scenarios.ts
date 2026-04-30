import type { ScenarioId } from "./schema";

export interface ScenarioDefinition {
  id: ScenarioId;
  label: string;
  shortLabel: string;
  /** Editorial description shown in selectors and methodology. */
  description: string;
  /** Hex colour used for the line geometry overlay on the map. */
  lineColor: string;
  /** Optional citation key into data/references.ts. */
  referenceKey?: string;
}

/**
 * Disruption scenarios used in the Story scrollytelling and the Explorer
 * choropleth. The three routes were selected because they showcase three
 * distinct spatial signatures of single-route bus disruption found in the
 * 543-route LTRS analysis (see frames.ts and methodology). Each id matches
 * the prefix used in `web/public/data/lsoa_ltis.geojson`.
 */
export const SCENARIO_REGISTRY: Record<ScenarioId, ScenarioDefinition> = {
  "99": {
    id: "99",
    label: "Bus Route 99 disruption",
    shortLabel: "Route 99",
    description:
      "An east-London bus route. Cancellation pushes 697 grid cells into the 'critical' loss band, with Bexley LSOAs losing 18.4 % of mean accessibility. Sharp, deep punch.",
    lineColor: "#df4b3f",
  },
  "R2": {
    id: "R2",
    label: "Bus Route R2 disruption",
    shortLabel: "Route R2",
    description:
      "A south-London bus route with the widest spatial spread of all 543 routes — 1,738 grid cells affected. Bromley LSOAs lose 6.3 % on average.",
    lineColor: "#dc6d57",
  },
  "685": {
    id: "685",
    label: "Bus Route 685 disruption",
    shortLabel: "Route 685",
    description:
      "A northwest-London bus route. Smallest footprint (329 cells) but deepest local impact: Croydon LSOAs along its corridor lose up to 38.6 % of accessibility.",
    lineColor: "#b72230",
  },
};

export const ALL_SCENARIO_IDS: ScenarioId[] = Object.keys(SCENARIO_REGISTRY);

export const DEFAULT_SCENARIO_ID: ScenarioId = "99";

export function getScenarioDefinition(id: ScenarioId): ScenarioDefinition {
  const def = SCENARIO_REGISTRY[id];
  if (!def) {
    throw new Error(`Unknown scenario id: ${id}`);
  }
  return def;
}
