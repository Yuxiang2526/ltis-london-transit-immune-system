import { useState } from "react";
import type { LSOAFeature, MapMetric, ScenarioId } from "../data/schema";
import { DEFAULT_SCENARIO_ID } from "../data/scenarios";
import { DEFAULT_MAP_METRIC } from "../data/metrics";

export function useLTISState() {
  const [scenario, setScenario] = useState<ScenarioId>(DEFAULT_SCENARIO_ID);
  const [metric, setMetric] = useState<MapMetric>(DEFAULT_MAP_METRIC);
  const [selectedFeature, setSelectedFeature] = useState<LSOAFeature | null>(null);
  const [hoveredFeature, setHoveredFeature] = useState<LSOAFeature | null>(null);

  return {
    scenario,
    setScenario,
    metric,
    setMetric,
    selectedFeature,
    setSelectedFeature,
    hoveredFeature,
    setHoveredFeature,
  };
}
