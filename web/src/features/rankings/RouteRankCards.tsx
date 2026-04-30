import { useRouteRankings } from "./useRouteRankings";
import "./RouteRankings.css";

/**
 * Five rank cards — the most-disruptive regular London routes by number of
 * LSOAs that fall below the 12-minute walking-access threshold when the
 * route is cancelled. Inspired by the editorial "Five routes that matter
 * most" treatment in CASA Group reference projects.
 */
export default function RouteRankCards() {
  const { data, error } = useRouteRankings();

  if (error) {
    return (
      <div className="route-rank__error">Could not load route rankings: {error}</div>
    );
  }

  if (!data) {
    return (
      <div className="route-rank__loading">
        <div className="route-rank__skeleton-row">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="route-rank__skeleton" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="route-rank">
      {data.top5.map((r, i) => (
        <article key={r.route} className="route-rank__card">
          <header className="route-rank__head">
            <span className="route-rank__rank num-mono">RANK 0{i + 1}</span>
            <span className={`route-rank__chip route-rank__chip--${r.mode}`}>
              {r.mode === "rail" ? "Rail" : "Bus"}
            </span>
          </header>

          <h3 className="route-rank__route num-mono">{r.route}</h3>

          <dl className="route-rank__metrics">
            <div>
              <dt>LSOAs losing 12-min</dt>
              <dd className="route-rank__metric-value route-rank__metric-value--alarm num-mono">
                {r.lost12minAccessLsoa}
              </dd>
            </div>
            <div>
              <dt>LSOAs affected</dt>
              <dd className="num-mono">{r.affectedLsoa}</dd>
            </div>
            <div>
              <dt>Mean delay</dt>
              <dd className="num-mono">{r.meanDelayMin.toFixed(1)} min</dd>
            </div>
            <div>
              <dt>Retention</dt>
              <dd className="num-mono">{(r.retentionRatio * 100).toFixed(1)}%</dd>
            </div>
          </dl>
        </article>
      ))}
    </div>
  );
}
