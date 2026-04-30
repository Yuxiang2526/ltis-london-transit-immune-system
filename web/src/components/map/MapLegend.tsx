import type { MapMetric, ScenarioId } from "../../data/schema";
import { getMetricDefinition } from "../../data/metrics";
import { getScenarioDefinition } from "../../data/scenarios";
import { getLegendGradient, getPaintConfig } from "../../lib/mapExpressions";

interface MapLegendProps {
  scenario: ScenarioId;
  metric: MapMetric;
}

export default function MapLegend({ scenario, metric }: MapLegendProps) {
  const metricDef = getMetricDefinition(metric);
  const scenarioDef = getScenarioDefinition(scenario);
  const paint = getPaintConfig(scenario, metric);

  // For baseline_ltis the scenario is irrelevant (the value doesn't depend on
  // which route is "removed"); showing one is misleading.
  const showScenario = metric !== "baseline_ltis";

  return (
    <div className="map-legend">
      <div className="legend-title">{metricDef.legendTitle}</div>
      {showScenario ? (
        <div className="legend-subtitle">Scenario: {scenarioDef.shortLabel}</div>
      ) : (
        <div className="legend-subtitle">Across all 4,994 LSOAs</div>
      )}

      <div
        className="legend-gradient"
        style={{ background: getLegendGradient(paint) }}
        role="img"
        aria-label={`${metricDef.legendTitle} colour ramp`}
      />

      <div className="legend-labels">
        {paint.legendTicks.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
    </div>
  );
}
