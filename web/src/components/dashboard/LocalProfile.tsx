import type { LTISFeature, ScenarioId } from "../../types/data";
import {
  getScenarioDependency,
  getScenarioExposure,
  getScenarioLoss,
  getScenarioRetention,
  makeInsightSentence
} from "../../lib/analytics";
import { formatPercent, formatPopulation, formatScore } from "../../lib/format";

interface LocalProfileProps {
  feature: LTISFeature | null;
  scenario: ScenarioId;
}

export default function LocalProfile({ feature, scenario }: LocalProfileProps) {
  if (!feature) {
    return (
      <section className="local-profile empty">
        <h3>Local immune profile</h3>
        <p>
          Hover or click a neighbourhood to inspect its fallback mobility,
          disruption sensitivity and dependency.
        </p>
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
          <span>Baseline LTIS</span>
          <strong>{formatScore(p.baseline_ltis)}</strong>
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

        <div>
          <span>Mode diversity</span>
          <strong>{formatScore(p.mode_diversity)}</strong>
        </div>
      </div>

      <div className="insight-box">
        <h4>Interpretation</h4>
        <p>{makeInsightSentence(p, scenario)}</p>
      </div>
    </section>
  );
}