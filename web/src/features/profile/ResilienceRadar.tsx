import { useMemo } from "react";
import {
  FALLBACK_DIMENSIONS,
  type FallbackDimension,
  type FallbackProfile,
} from "../../data/schema";
import "./ResilienceRadar.css";

interface ResilienceRadarProps {
  /** Primary profile (e.g. the selected scenario). */
  profile: FallbackProfile;
  /** Optional baseline profile drawn behind for contrast. */
  baseline?: FallbackProfile;
  /** Side length in px of the SVG square. */
  size?: number;
  /** Title shown above the chart. */
  title?: string;
}

const DIMENSION_LABEL: Record<FallbackDimension, string> = {
  redundancy: "Redundancy",
  busFallback: "Bus fallback",
  cycleFallback: "Cycle fallback",
  modalDiversity: "Modal diversity",
  dependencyRisk: "Dependency risk",
};

const RING_LEVELS = [0.2, 0.4, 0.6, 0.8, 1.0];

/**
 * Five-dimension fallback profile radar — fulfils the visual promised in the
 * opening presentation (slide 11). Pure SVG, no chart library required.
 *
 * Reads from the canonical FALLBACK_DIMENSIONS list so adding a sixth
 * dimension is a one-line change in schema.ts.
 */
export default function ResilienceRadar({
  profile,
  baseline,
  size = 280,
  title,
}: ResilienceRadarProps) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.36; // leave room for axis labels

  const axes = useMemo(() => {
    const n = FALLBACK_DIMENSIONS.length;
    return FALLBACK_DIMENSIONS.map((dim, i) => {
      // Start at 12 o'clock, go clockwise.
      const angle = -Math.PI / 2 + (i * 2 * Math.PI) / n;
      return {
        dimension: dim,
        label: DIMENSION_LABEL[dim],
        angle,
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius,
        labelX: cx + Math.cos(angle) * (radius + 24),
        labelY: cy + Math.sin(angle) * (radius + 24),
      };
    });
  }, [cx, cy, radius]);

  const buildPolygon = (p: FallbackProfile): string =>
    axes
      .map((axis) => {
        const value = clamp01(p[axis.dimension]);
        const x = cx + Math.cos(axis.angle) * radius * value;
        const y = cy + Math.sin(axis.angle) * radius * value;
        return `${x.toFixed(2)},${y.toFixed(2)}`;
      })
      .join(" ");

  return (
    <div className="resilience-radar" role="img" aria-label={title ?? "Fallback profile radar"}>
      {title ? <div className="resilience-radar-title">{title}</div> : null}

      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Concentric grid rings */}
        {RING_LEVELS.map((level) => (
          <circle
            key={level}
            cx={cx}
            cy={cy}
            r={radius * level}
            className="radar-ring"
          />
        ))}

        {/* Axis spokes */}
        {axes.map((axis) => (
          <line
            key={axis.dimension}
            x1={cx}
            y1={cy}
            x2={axis.x}
            y2={axis.y}
            className="radar-spoke"
          />
        ))}

        {/* Baseline polygon (drawn behind) */}
        {baseline ? (
          <polygon
            points={buildPolygon(baseline)}
            className="radar-area radar-area-baseline"
          />
        ) : null}

        {/* Primary polygon */}
        <polygon points={buildPolygon(profile)} className="radar-area radar-area-primary" />

        {/* Vertices */}
        {axes.map((axis) => {
          const value = clamp01(profile[axis.dimension]);
          const x = cx + Math.cos(axis.angle) * radius * value;
          const y = cy + Math.sin(axis.angle) * radius * value;
          return (
            <circle
              key={axis.dimension}
              cx={x}
              cy={y}
              r={3.5}
              className="radar-vertex"
            />
          );
        })}

        {/* Axis labels */}
        {axes.map((axis) => (
          <text
            key={axis.dimension}
            x={axis.labelX}
            y={axis.labelY}
            className="radar-label"
            textAnchor={textAnchorFor(axis.angle)}
            dominantBaseline="middle"
          >
            {axis.label}
          </text>
        ))}
      </svg>

      {baseline ? (
        <div className="radar-legend">
          <span className="radar-legend-item radar-legend-primary">Selected scenario</span>
          <span className="radar-legend-item radar-legend-baseline">Baseline</span>
        </div>
      ) : null}
    </div>
  );
}

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}

function textAnchorFor(angle: number): "start" | "middle" | "end" {
  const cosine = Math.cos(angle);
  if (cosine > 0.2) return "start";
  if (cosine < -0.2) return "end";
  return "middle";
}
