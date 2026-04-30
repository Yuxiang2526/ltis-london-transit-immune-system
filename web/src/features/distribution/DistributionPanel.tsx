import { useMemo } from "react";
import { useLTISDataContext } from "../../data/dataContext";

/**
 * Sits next to the Lorenz curve. Computes the same distribution that
 * Lorenz visualises, then surfaces the most cited summary statistics:
 *
 *   - bottom 50 % share (cumulative AI in the lower-half LSOAs)
 *   - top  10 % share (cumulative AI in the top-decile LSOAs)
 *   - ratio  (top decile mean / bottom decile mean)
 *
 * These three numbers turn the "moderate concentration" intuition from
 * the curve into something quantitative readers can quote.
 */
export default function DistributionPanel() {
  const { lsoaData } = useLTISDataContext();

  const stats = useMemo(() => {
    if (!lsoaData?.features?.length) return null;

    const ais = lsoaData.features
      .map((f) => Number((f.properties as { baseline_ai?: number }).baseline_ai ?? 0))
      .filter((v) => Number.isFinite(v) && v > 0)
      .sort((a, b) => a - b);

    const n = ais.length;
    if (n === 0) return null;

    const total = ais.reduce((s, v) => s + v, 0);

    const sumUpTo = (idx: number) => {
      let s = 0;
      for (let i = 0; i <= idx; i++) s += ais[i];
      return s;
    };

    const bottom50End = Math.floor(n * 0.5) - 1;
    const top10Start = Math.floor(n * 0.9);

    const bottom50Share = sumUpTo(bottom50End) / total;

    let top10Sum = 0;
    for (let i = top10Start; i < n; i++) top10Sum += ais[i];
    const top10Share = top10Sum / total;

    // Bottom decile mean / top decile mean
    const bottomDecileEnd = Math.floor(n * 0.1);
    const topDecileStart = Math.floor(n * 0.9);
    const bottomDecileMean =
      sumUpTo(bottomDecileEnd - 1) / Math.max(1, bottomDecileEnd);
    const topDecileMean =
      ais.slice(topDecileStart).reduce((s, v) => s + v, 0) /
      Math.max(1, n - topDecileStart);
    const ratio = topDecileMean / Math.max(0.0001, bottomDecileMean);

    return {
      bottom50Share,
      top10Share,
      ratio,
      bottomDecileMean,
      topDecileMean,
      maxAi: ais[n - 1],
      minAi: ais[0],
    };
  }, [lsoaData]);

  if (!stats) return null;

  return (
    <div className="distribution-panel">
      <p className="eyebrow">By the numbers</p>
      <h3>What the Lorenz curve tells us</h3>

      <ul className="distribution-panel__stats">
        <li className="distribution-panel__stat distribution-panel__stat--cool">
          <span className="distribution-panel__label">Bottom 50% LSOAs</span>
          <strong className="distribution-panel__value num-mono">
            {(stats.bottom50Share * 100).toFixed(1)}%
          </strong>
          <span className="distribution-panel__note">
            of total accessibility — under perfect equality, this would be 50 %.
          </span>
        </li>

        <li className="distribution-panel__stat distribution-panel__stat--warm">
          <span className="distribution-panel__label">Top 10% LSOAs</span>
          <strong className="distribution-panel__value num-mono">
            {(stats.top10Share * 100).toFixed(1)}%
          </strong>
          <span className="distribution-panel__note">
            of total accessibility — they have a disproportionate share.
          </span>
        </li>

        <li className="distribution-panel__stat distribution-panel__stat--accent">
          <span className="distribution-panel__label">Top decile / bottom decile</span>
          <strong className="distribution-panel__value num-mono">
            {stats.ratio.toFixed(1)}×
          </strong>
          <span className="distribution-panel__note">
            mean accessibility ratio between the most-served and least-served 10 %.
          </span>
        </li>
      </ul>

      <p className="distribution-panel__footnote muted">
        Range: <strong>{stats.minAi.toFixed(2)}</strong> (most isolated) →{" "}
        <strong>{stats.maxAi.toFixed(2)}</strong> (most accessible) ·
        across {lsoaData?.features?.length ?? 0} LSOAs.
      </p>
    </div>
  );
}
