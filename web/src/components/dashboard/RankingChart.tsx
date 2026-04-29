import type {
  LTISFeature,
  LTISFeatureCollection,
  MetricId,
  ScenarioId
} from "../../types/data";

import { getMetricValue } from "../../lib/analytics";
import { formatPopulation, formatScore, formatPercent } from "../../lib/format";
import { METRICS } from "../../config/metrics";

interface RankingChartProps {
  data: LTISFeatureCollection;
  scenario: ScenarioId;
  metric: MetricId;
  onSelectFeature: (feature: LTISFeature) => void;
}

export default function RankingChart({
  data,
  scenario,
  metric,
  onSelectFeature
}: RankingChartProps) {
  const rows = [...data.features]
    .map((feature) => ({
      feature,
      value: getMetricValue(feature.properties, scenario, metric)
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  const maxValue = Math.max(...rows.map((row) => row.value), 0.0001);

  return (
    <section className="chart-card">
      <div className="chart-header">
        <p className="eyebrow">Top affected neighbourhoods</p>
        <h3>{METRICS[metric].label}</h3>
      </div>

      <div className="ranking-list">
        {rows.map((row, index) => {
          const width = `${(row.value / maxValue) * 100}%`;

          return (
            <button
              key={row.feature.properties.lsoa_code}
              className="ranking-row"
              onClick={() => onSelectFeature(row.feature)}
            >
              <span className="rank-index">{index + 1}</span>

              <span className="rank-name">
                {row.feature.properties.lsoa_name}
                <small>{row.feature.properties.borough}</small>
              </span>

              <span className="rank-bar-track">
                <span className="rank-bar-fill" style={{ width }} />
              </span>

              <span className="rank-value">
                {formatChartValue(row.value, metric)}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function formatChartValue(value: number, metric: MetricId): string {
  if (metric === "retention" || metric === "dependency") {
    return formatPercent(value);
  }

  if (metric === "exposure") {
    return formatPopulation(value);
  }

  return formatScore(value);
}