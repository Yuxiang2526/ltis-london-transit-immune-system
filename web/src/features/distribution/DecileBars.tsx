import { useMemo } from "react";
import { useLTISDataContext } from "../../data/dataContext";

/**
 * Decile bars — split the 4,994 LSOAs into ten equal-sized buckets
 * sorted by baseline AI, then plot the mean AI of each bucket. A simple
 * second view of the same distribution Lorenz summarises, but rendered
 * with the project's diverging palette so every bar reads as
 * "where on the city's accessibility spectrum does this slice sit".
 */
export default function DecileBars() {
  const { lsoaData } = useLTISDataContext();

  const deciles = useMemo(() => {
    if (!lsoaData?.features?.length) return null;
    const ais = lsoaData.features
      .map((f) => Number((f.properties as { baseline_ai?: number }).baseline_ai ?? 0))
      .filter((v) => Number.isFinite(v) && v > 0)
      .sort((a, b) => a - b);
    const n = ais.length;
    if (n < 10) return null;

    const buckets: { idx: number; mean: number; count: number }[] = [];
    for (let i = 0; i < 10; i++) {
      const start = Math.floor((i * n) / 10);
      const end = Math.floor(((i + 1) * n) / 10);
      const slice = ais.slice(start, end);
      const sum = slice.reduce((s, v) => s + v, 0);
      buckets.push({
        idx: i + 1,
        mean: sum / slice.length,
        count: slice.length,
      });
    }
    const max = Math.max(...buckets.map((b) => b.mean));
    return { buckets, max };
  }, [lsoaData]);

  if (!deciles) return null;

  // 10-step RdBu — bottom decile = deepest blue, top = burgundy.
  const COLORS = [
    "#104680", "#317CB7", "#6DADE1", "#B6D7E8", "#E9F1F4",
    "#FBE3D5", "#F6B293", "#DC6D57", "#B72230", "#6D011F",
  ];

  return (
    <div className="decile-bars">
      <header className="decile-bars__head">
        <p className="eyebrow">Decile distribution</p>
        <h3>Mean baseline AI per decile</h3>
        <p className="muted">
          The bottom 10 % of LSOAs share a mean AI under{" "}
          <strong className="num-mono">{deciles.buckets[0].mean.toFixed(1)}</strong>;
          the top 10 % average{" "}
          <strong className="num-mono">{deciles.buckets[9].mean.toFixed(1)}</strong> —
          a {(deciles.buckets[9].mean / deciles.buckets[0].mean).toFixed(1)}× spread.
        </p>
      </header>

      <div className="decile-bars__grid">
        {deciles.buckets.map((b, i) => {
          const heightPct = (b.mean / deciles.max) * 100;
          return (
            <div key={b.idx} className="decile-bars__col">
              <div className="decile-bars__track">
                <div
                  className="decile-bars__bar"
                  style={{
                    height: `${heightPct}%`,
                    background: COLORS[i],
                  }}
                  title={`Decile ${b.idx}: mean AI ${b.mean.toFixed(2)} · ${b.count} LSOAs`}
                />
              </div>
              <div className="decile-bars__value num-mono">{b.mean.toFixed(1)}</div>
              <div className="decile-bars__rank num-mono">D{b.idx}</div>
            </div>
          );
        })}
      </div>

      <p className="decile-bars__legend muted">
        D1 = least-accessible 10 %, D10 = most-accessible 10 %. Bar height is
        the decile's mean baseline AI; colour follows the project RdBu palette.
      </p>
    </div>
  );
}
