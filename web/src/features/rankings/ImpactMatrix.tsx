import { useRouteRankings } from "./useRouteRankings";
import "./RouteRankings.css";

/**
 * Impact matrix — top 10 routes × 4 normalised metrics. Each cell is
 * coloured by intensity relative to the maximum across all 418 regular
 * routes (so a cell that's "100%" really is the worst route on that
 * metric). Built to mirror the editorial impact-matrix treatment seen in
 * the CASA reference projects.
 */

interface Metric {
  key: "lost12minAccessLsoa" | "affectedLsoa" | "meanDelayMin" | "retentionRatio";
  label: string;
  /** Direction "worse-is-bigger" (true) vs "worse-is-smaller" (false, e.g. retention). */
  inverse: boolean;
}

const METRICS: Metric[] = [
  { key: "lost12minAccessLsoa", label: "LSOAs losing 12-min", inverse: false },
  { key: "affectedLsoa",        label: "LSOAs affected",       inverse: false },
  { key: "meanDelayMin",        label: "Mean delay (min)",     inverse: false },
  { key: "retentionRatio",      label: "Lost retention (1−ρ)", inverse: true  },
];

/** Returns CSS color in the warm palette ramp, given t ∈ [0, 1]. */
function rampColor(t: number): string {
  // Same warm ramp used by the choropleth — pale → burgundy.
  // [#fbe3d5, #f6b293, #dc6d57, #b72230, #6d011f]
  const stops: [number, [number, number, number]][] = [
    [0.0,  [251, 227, 213]],
    [0.25, [246, 178, 147]],
    [0.5,  [220, 109,  87]],
    [0.75, [183,  34,  48]],
    [1.0,  [109,   1,  31]],
  ];
  if (t <= 0) return `rgb(${stops[0][1].join(",")})`;
  if (t >= 1) return `rgb(${stops[stops.length - 1][1].join(",")})`;
  for (let i = 0; i < stops.length - 1; i++) {
    const [t0, c0] = stops[i];
    const [t1, c1] = stops[i + 1];
    if (t >= t0 && t <= t1) {
      const k = (t - t0) / (t1 - t0);
      const r = Math.round(c0[0] + (c1[0] - c0[0]) * k);
      const g = Math.round(c0[1] + (c1[1] - c0[1]) * k);
      const b = Math.round(c0[2] + (c1[2] - c0[2]) * k);
      return `rgb(${r},${g},${b})`;
    }
  }
  return `rgb(${stops[0][1].join(",")})`;
}

export default function ImpactMatrix() {
  const { data, error } = useRouteRankings();

  if (error) {
    return <div className="route-rank__error">{error}</div>;
  }

  if (!data) {
    return <div className="impact-matrix__skeleton" aria-busy="true" />;
  }

  // For each metric we normalise vs the city-wide max for that metric.
  const norm = (rec: typeof data.top10[number], m: Metric): number => {
    if (m.inverse) {
      // retention is in [0,1]; "lost retention" is (1 − ρ). Max possible = 1.
      return 1 - rec.retentionRatio;
    }
    const denom = data.normaliseBasis[m.key as keyof typeof data.normaliseBasis] ?? 1;
    return Math.min(1, (rec[m.key] as number) / denom);
  };

  const formatCell = (rec: typeof data.top10[number], m: Metric): string => {
    if (m.inverse) return `${((1 - rec.retentionRatio) * 100).toFixed(1)}%`;
    if (m.key === "meanDelayMin") return rec.meanDelayMin.toFixed(1);
    return String(rec[m.key]);
  };

  return (
    <div className="impact-matrix">
      <div
        className="impact-matrix__grid"
        style={{ gridTemplateColumns: `120px 80px repeat(${METRICS.length}, minmax(120px, 1fr))` }}
      >
        {/* Header row */}
        <div className="impact-matrix__head">Route</div>
        <div className="impact-matrix__head">Mode</div>
        {METRICS.map((m) => (
          <div key={m.key} className="impact-matrix__head impact-matrix__head--metric">
            {m.label}
          </div>
        ))}

        {/* Data rows */}
        {data.top10.map((rec) => (
          <div key={rec.route} className="impact-matrix__row" style={{ display: "contents" }}>
            <div className="impact-matrix__route num-mono">{rec.route}</div>
            <div className="impact-matrix__mode">
              <span className={`route-rank__chip route-rank__chip--${rec.mode}`}>
                {rec.mode === "rail" ? "Rail" : "Bus"}
              </span>
            </div>
            {METRICS.map((m) => {
              const t = norm(rec, m);
              return (
                <div
                  key={m.key}
                  className="impact-matrix__cell num-mono"
                  style={{
                    backgroundColor: rampColor(t),
                    color: t > 0.55 ? "white" : "var(--color-text-strong)",
                  }}
                >
                  {formatCell(rec, m)}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="impact-matrix__legend">
        <span className="muted">Cell colour intensity = metric percentile across all {data.generatedFromRegularRoutes} regular routes.</span>
        <span
          className="impact-matrix__ramp"
          aria-hidden="true"
          style={{
            background:
              "linear-gradient(90deg, rgb(251,227,213), rgb(246,178,147), rgb(220,109,87), rgb(183,34,48), rgb(109,1,31))",
          }}
        />
        <span className="muted">low → high impact</span>
      </div>
    </div>
  );
}
