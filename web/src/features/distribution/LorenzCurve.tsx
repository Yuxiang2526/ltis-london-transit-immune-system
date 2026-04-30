import { useMemo } from "react";
import type {
  LSOAFeatureCollection,
  MapMetric,
  ScenarioId,
} from "../../data/schema";
import { getMetricValue } from "../../lib/analytics";
import { getMetricDefinition } from "../../data/metrics";
import { getScenarioDefinition } from "../../data/scenarios";
import "./LorenzCurve.css";

interface LorenzCurveProps {
  data: LSOAFeatureCollection;
  scenario: ScenarioId;
  metric: MapMetric;
  width?: number;
  height?: number;
}

/**
 * Distribution view: Lorenz curve + Gini coefficient.
 *
 * Reads the same scenario / metric pair as the choropleth so the analyst can
 * answer "is this a city-wide problem or concentrated in a few LSOAs?".
 *
 * Gini ≈ 0  → loss / exposure spread evenly across all LSOAs.
 * Gini ≈ 1  → loss / exposure concentrated in a tiny number of LSOAs.
 */
export default function LorenzCurve({
  data,
  scenario,
  metric,
  width = 360,
  height = 280,
}: LorenzCurveProps) {
  const padding = { top: 16, right: 16, bottom: 36, left: 44 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  const { points, gini } = useMemo(() => {
    const values = data.features
      .map((f) => getMetricValue(f.properties, scenario, metric))
      .filter((v) => Number.isFinite(v) && v >= 0)
      .sort((a, b) => a - b);

    if (values.length === 0) {
      return { points: [[0, 0]] as [number, number][], gini: 0 };
    }

    const total = values.reduce((s, v) => s + v, 0);
    if (total === 0) {
      return {
        points: [
          [0, 0],
          [1, 0],
          [1, 1],
        ] as [number, number][],
        gini: 0,
      };
    }

    let cumValue = 0;
    const lorenzPts: [number, number][] = [[0, 0]];
    values.forEach((v, i) => {
      cumValue += v;
      lorenzPts.push([(i + 1) / values.length, cumValue / total]);
    });

    // Gini via the standard discrete formula: 1 − 2 × area under Lorenz curve.
    let areaUnder = 0;
    for (let i = 1; i < lorenzPts.length; i++) {
      const [x0, y0] = lorenzPts[i - 1];
      const [x1, y1] = lorenzPts[i];
      areaUnder += ((y0 + y1) / 2) * (x1 - x0);
    }
    return { points: lorenzPts, gini: 1 - 2 * areaUnder };
  }, [data, scenario, metric]);

  const x = (p: number) => padding.left + p * innerW;
  const y = (p: number) => padding.top + (1 - p) * innerH;

  const lorenzPath =
    "M " + points.map(([px, py]) => `${x(px).toFixed(1)} ${y(py).toFixed(1)}`).join(" L ");

  const metricDef = getMetricDefinition(metric);
  const scenarioDef = getScenarioDefinition(scenario);

  return (
    <section className="lorenz-card">
      <div className="lorenz-header">
        <p className="eyebrow">Distributional concentration</p>
        <h3>How concentrated is the {metricDef.shortLabel.toLowerCase()}?</h3>
        <p className="muted">
          {metric === "baseline_ltis"
            ? "Across all 4,994 London LSOAs"
            : `${scenarioDef.shortLabel} disruption`}{" "}
          · Gini = <strong className="num">{gini.toFixed(2)}</strong>
        </p>
      </div>

      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="lorenz-svg"
      >
        {/* Axes */}
        <line
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={padding.top + innerH}
          className="axis-line"
        />
        <line
          x1={padding.left}
          y1={padding.top + innerH}
          x2={padding.left + innerW}
          y2={padding.top + innerH}
          className="axis-line"
        />

        {/* Equality reference */}
        <line
          x1={x(0)}
          y1={y(0)}
          x2={x(1)}
          y2={y(1)}
          className="equality-line"
        />

        {/* Inequality area between Lorenz and equality */}
        <path
          d={`${lorenzPath} L ${x(1).toFixed(1)} ${y(0).toFixed(1)} Z`}
          className="inequality-area"
        />

        {/* Lorenz curve itself */}
        <path d={lorenzPath} className="lorenz-line" />

        {/* Axis labels */}
        <text
          x={padding.left + innerW / 2}
          y={height - 8}
          className="axis-label"
          textAnchor="middle"
        >
          Cumulative share of LSOAs
        </text>
        <text
          x={12}
          y={padding.top + innerH / 2}
          className="axis-label"
          textAnchor="middle"
          transform={`rotate(-90, 12, ${padding.top + innerH / 2})`}
        >
          Cumulative share of {metricDef.shortLabel.toLowerCase()}
        </text>
      </svg>
    </section>
  );
}
