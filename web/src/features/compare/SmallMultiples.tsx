import { useMemo } from "react";
import { geoMercator, geoPath } from "d3-geo";

import type {
  LSOAFeatureCollection,
  MapMetric,
  ScenarioId,
} from "../../data/schema";
import { getMetricValue } from "../../lib/analytics";
import { getMetricDefinition } from "../../data/metrics";
import { getScenarioDefinition } from "../../data/scenarios";
import { getPaintConfig } from "../../lib/mapExpressions";
import { ALL_SCENARIO_IDS } from "../../data/scenarios";
import "./SmallMultiples.css";

interface SmallMultiplesProps {
  data: LSOAFeatureCollection;
  metric: MapMetric;
  /** Optional restrict to a subset of scenarios. Defaults to all. */
  scenarioIds?: ScenarioId[];
  /** Tile width / height in px. */
  tileSize?: number;
  /** Active scenario; the matching tile gets a highlight border. */
  activeScenario?: ScenarioId;
  /** Click on a tile selects the scenario in the parent. */
  onSelectScenario?: (id: ScenarioId) => void;
}

/**
 * Cross-scenario small-multiples grid: every tile shows the SAME LSOA
 * geometry coloured by the SAME metric, varying only the scenario applied.
 * This is the visualisation type Tufte / Cleveland argue for when the
 * analytical question is "how does X differ across N conditions?".
 *
 * The colour ramp is shared across tiles via `getPaintConfig`, so a value
 * read on one tile is directly comparable to a value read on another.
 */
export default function SmallMultiples({
  data,
  metric,
  scenarioIds = ALL_SCENARIO_IDS,
  tileSize = 280,
  activeScenario,
  onSelectScenario,
}: SmallMultiplesProps) {
  const metricDef = getMetricDefinition(metric);

  // Project geometry once; reuse across all tiles.
  const path = useMemo(() => {
    const projection = geoMercator().fitSize([tileSize, tileSize], data as never);
    return geoPath(projection);
  }, [data, tileSize]);

  return (
    <section className="small-multiples">
      <header className="small-multiples-header">
        <p className="eyebrow">Cross-scenario comparison</p>
        <h3>{metricDef.label} across disruption scenarios</h3>
        <p className="muted">
          Same geometry, same colour scale; only the disrupted line differs. Use
          this view to spot scenarios that load differently on the same place.
        </p>
      </header>

      <div className="small-multiples-grid">
        {scenarioIds.map((scenarioId) => {
          const scenarioDef = getScenarioDefinition(scenarioId);
          const paint = getPaintConfig(scenarioId, metric);
          const isActive = activeScenario === scenarioId;

          return (
            <button
              key={scenarioId}
              type="button"
              className="small-multiples-tile"
              data-active={isActive || undefined}
              onClick={() => onSelectScenario?.(scenarioId)}
              aria-label={`Select ${scenarioDef.label}`}
            >
              <svg
                width={tileSize}
                height={tileSize}
                viewBox={`0 0 ${tileSize} ${tileSize}`}
                role="img"
                aria-label={`${scenarioDef.label} choropleth`}
              >
                <rect
                  x={0}
                  y={0}
                  width={tileSize}
                  height={tileSize}
                  className="tile-bg"
                />
                {data.features.map((feature, i) => {
                  const value = getMetricValue(feature.properties, scenarioId, metric);
                  return (
                    <path
                      key={feature.properties.lsoa_code ?? i}
                      d={path(feature as never) ?? ""}
                      fill={interpolateRamp(paint.stops, value)}
                      stroke="rgba(255,255,255,0.18)"
                      strokeWidth={0.4}
                    />
                  );
                })}
              </svg>

              <div className="small-multiples-meta">
                <span
                  className="tile-line-pip"
                  style={{ background: scenarioDef.lineColor }}
                  aria-hidden="true"
                />
                <strong>{scenarioDef.shortLabel}</strong>
                <span className="muted"> line</span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

/** Linear interpolation across a sequence of [domainValue, color] stops. */
function interpolateRamp(
  stops: readonly (readonly [number, string])[],
  value: number,
): string {
  if (stops.length === 0) return "#000";
  if (value <= stops[0][0]) return stops[0][1];
  if (value >= stops[stops.length - 1][0]) return stops[stops.length - 1][1];
  for (let i = 1; i < stops.length; i++) {
    const [v1, c1] = stops[i - 1];
    const [v2, c2] = stops[i];
    if (value <= v2) {
      const t = (value - v1) / (v2 - v1);
      return mixHex(c1, c2, t);
    }
  }
  return stops[stops.length - 1][1];
}

function mixHex(a: string, b: string, t: number): string {
  const ar = parseInt(a.slice(1, 3), 16);
  const ag = parseInt(a.slice(3, 5), 16);
  const ab = parseInt(a.slice(5, 7), 16);
  const br = parseInt(b.slice(1, 3), 16);
  const bg = parseInt(b.slice(3, 5), 16);
  const bb = parseInt(b.slice(5, 7), 16);
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const blue = Math.round(ab + (bb - ab) * t);
  return `#${[r, g, blue].map((n) => n.toString(16).padStart(2, "0")).join("")}`;
}
