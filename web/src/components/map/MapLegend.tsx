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

  return (
    <div className="map-legend">
      <div className="legend-title">{metricDef.legendTitle}</div>
      <div className="legend-subtitle">Scenario: {scenarioDef.shortLabel}</div>

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
