import { useMemo } from "react";
import { useLTISDataContext } from "../../data/dataContext";
import { useRouteRankings } from "./useRouteRankings";

/**
 * Editorial headline strip for the Explorer page. Four big numbers, each in
 * its own colour role from the diverging palette, with a small inline SVG.
 * Intentionally NOT reusing MetricCard — this needs more weight.
 */
export default function HeadlineStrip() {
  const { lsoaData } = useLTISDataContext();
  const { data: rankings } = useRouteRankings();

  const lsoaCount = lsoaData?.features.length ?? 4994;
  const routesCount = rankings?.generatedFromRegularRoutes ?? 418;
  const top1 = rankings?.top5[0];

  /** Live Gini on baseline AI — the same distribution the Lorenz/Decile/
   *  DistributionPanel components render. Computed once per dataset so the
   *  headline number is always in sync with the chart on screen. */
  const baselineGini = useMemo(() => {
    if (!lsoaData?.features?.length) return null;
    const values = lsoaData.features
      .map((f) => Number((f.properties as { baseline_ai?: number }).baseline_ai ?? 0))
      .filter((v) => Number.isFinite(v) && v > 0)
      .sort((a, b) => a - b);
    const n = values.length;
    if (n < 2) return null;
    const total = values.reduce((s, v) => s + v, 0);
    if (total === 0) return null;
    let cum = 0;
    let areaUnder = 0;
    let prev = 0;
    for (let i = 0; i < n; i++) {
      cum += values[i];
      const y = cum / total;
      areaUnder += ((prev + y) / 2) * (1 / n);
      prev = y;
    }
    return 1 - 2 * areaUnder;
  }, [lsoaData]);

  return (
    <section className="headline-strip" aria-label="Key project numbers">
      <article className="headline-strip__cell headline-strip__cell--cool">
        <span className="headline-strip__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2" fill="none">
            <circle cx="12" cy="12" r="9" />
            <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
          </svg>
        </span>
        <p className="headline-strip__label">London LSOAs</p>
        <h3 className="headline-strip__value num-mono">{lsoaCount.toLocaleString()}</h3>
        <p className="headline-strip__note">2021 ONS spatial unit</p>
      </article>

      <article className="headline-strip__cell headline-strip__cell--cool">
        <span className="headline-strip__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2" fill="none">
            <path d="M5 19V7a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v12" />
            <path d="M5 19h14M9 19v-3M15 19v-3" />
            <circle cx="9" cy="10" r="1" fill="currentColor" stroke="none" />
            <circle cx="15" cy="10" r="1" fill="currentColor" stroke="none" />
          </svg>
        </span>
        <p className="headline-strip__label">Regular routes modelled</p>
        <h3 className="headline-strip__value num-mono">{routesCount}</h3>
        <p className="headline-strip__note">Tube · Overground · DLR · 400+ buses</p>
      </article>

      <article className="headline-strip__cell headline-strip__cell--warm">
        <span className="headline-strip__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2" fill="none">
            <path d="M12 3v18M5 9l7-6 7 6M5 15l7 6 7-6" />
          </svg>
        </span>
        <p className="headline-strip__label">Most disruptive route</p>
        <h3 className="headline-strip__value num-mono">{top1?.route ?? "191"}</h3>
        <p className="headline-strip__note">
          {top1 ? `${top1.lost12minAccessLsoa} LSOAs lose 12-min access` : "11 LSOAs lose 12-min access"}
        </p>
      </article>

      <article className="headline-strip__cell headline-strip__cell--accent">
        <span className="headline-strip__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2" fill="none">
            <path d="M3 21h18M5 21V8l14 13M5 8l14-5v18" />
          </svg>
        </span>
        <p className="headline-strip__label">Baseline Gini</p>
        <h3 className="headline-strip__value num-mono">
          {baselineGini !== null ? baselineGini.toFixed(2) : "—"}
        </h3>
        <p className="headline-strip__note">Live AI inequality across {lsoaCount.toLocaleString()} LSOAs</p>
      </article>
    </section>
  );
}
