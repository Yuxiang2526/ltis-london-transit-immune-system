import { useMemo } from "react";
import type { LTISFeature, ScenarioId } from "../../types/data";
import {
  getScenarioDependency,
  getScenarioExposure,
  getScenarioLoss,
  getScenarioRetention,
  makeInsightSentence,
} from "../../lib/analytics";
import { formatPercent, formatPopulation, formatScore } from "../../lib/format";
import { useLTISDataContext } from "../../data/dataContext";

interface LocalProfileProps {
  feature: LTISFeature | null;
  scenario: ScenarioId;
  /** Optional callback so the empty-state suggestion cards can drive the map. */
  onSelectFeature?: (feature: LTISFeature) => void;
}

interface SuggestionPick {
  feature: LTISFeature;
  label: string;
  hint: string;
  tone: "cool" | "warm" | "neutral";
}

/**
 * Local profile panel.
 *
 *  - empty state (nothing hovered/selected): show 6 curated quick-inspect
 *    LSOAs spanning the percentile range, so the panel is never just a
 *    placeholder paragraph
 *  - active state: detailed metrics + insight sentence for the focus LSOA
 */
export default function LocalProfile({
  feature,
  scenario,
  onSelectFeature,
}: LocalProfileProps) {
  const { lsoaData } = useLTISDataContext();

  const suggestions = useMemo<SuggestionPick[]>(() => {
    if (!lsoaData?.features?.length) return [];
    // Sort by baseline_ltis ascending and pick representative percentile picks.
    const sorted = [...lsoaData.features].sort(
      (a, b) =>
        (a.properties.baseline_ltis as number) -
        (b.properties.baseline_ltis as number),
    );
    const n = sorted.length;
    if (n === 0) return [];

    const pickAt = (
      pct: number,
      label: string,
      hint: string,
      tone: SuggestionPick["tone"],
    ): SuggestionPick => {
      const idx = Math.min(n - 1, Math.max(0, Math.round(pct * (n - 1))));
      return { feature: sorted[idx] as LTISFeature, label, hint, tone };
    };

    return [
      pickAt(0.99, "Top 1%", "Most accessible LSOA", "cool"),
      pickAt(0.85, "Top 15%", "High accessibility", "cool"),
      pickAt(0.6, "Median+", "Just above the middle", "neutral"),
      pickAt(0.4, "Median−", "Just below the middle", "neutral"),
      pickAt(0.15, "Bottom 15%", "Limited accessibility", "warm"),
      pickAt(0.01, "Bottom 1%", "Most isolated LSOA", "warm"),
    ];
  }, [lsoaData]);

  if (!feature) {
    return (
      <section className="local-profile local-profile--empty">
        <p className="eyebrow">Local resilience profile</p>
        <h3>Pick any LSOA — or start with one of these.</h3>
        <p className="muted">
          Six representative neighbourhoods spanning London's accessibility
          range. Click one to see its profile in this panel and on the map.
        </p>

        <div className="local-suggestions">
          {suggestions.map((s) => {
            const p = s.feature.properties;
            const baselineAi = (p as { baseline_ai?: number }).baseline_ai ?? 0;
            return (
              <button
                key={p.lsoa_code}
                type="button"
                className={`local-suggestions__card local-suggestions__card--${s.tone}`}
                onClick={() => onSelectFeature?.(s.feature)}
                title={`Inspect ${p.lsoa_name}`}
              >
                <span className={`local-suggestions__pip local-suggestions__pip--${s.tone}`} />
                <div>
                  <p className="local-suggestions__pct num-mono">{s.label}</p>
                  <p className="local-suggestions__name">{p.lsoa_name}</p>
                  <p className="local-suggestions__hint muted">{s.hint}</p>
                  <p className="local-suggestions__metric num-mono">
                    AI {Number(baselineAi).toFixed(1)}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    );
  }

  const p = feature.properties;
  const retention = getScenarioRetention(p, scenario);
  const loss = getScenarioLoss(p, scenario);
  const exposure = getScenarioExposure(p, scenario);
  const dependency = getScenarioDependency(p, scenario);

  return (
    <section className="local-profile">
      <p className="eyebrow">Selected neighbourhood</p>
      <h3>{p.lsoa_name}</h3>
      <p className="muted">{p.borough}</p>

      <div className="profile-metrics">
        <div>
          <span>Baseline LTRS rank</span>
          <strong>{formatScore(p.baseline_ltis)}</strong>
        </div>

        <div>
          <span>Baseline AI (absolute)</span>
          <strong>{formatScore(p.baseline_ai as number | null | undefined)}</strong>
        </div>

        <div>
          <span>Retained mobility</span>
          <strong>{formatPercent(retention)}</strong>
        </div>

        <div>
          <span>Accessibility loss</span>
          <strong>{formatScore(loss)}</strong>
        </div>

        <div>
          <span>Population exposure</span>
          <strong>{formatPopulation(exposure)}</strong>
        </div>

        <div>
          <span>Line dependency</span>
          <strong>{formatPercent(dependency)}</strong>
        </div>
      </div>

      <div className="insight-box">
        <h4>Interpretation</h4>
        <p>{makeInsightSentence(p, scenario)}</p>
      </div>
    </section>
  );
}
