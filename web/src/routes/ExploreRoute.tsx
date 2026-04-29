import { useLTISDataContext } from "../data/dataContext";
import { useLTISState } from "../hooks/useLTISState";

import ScenarioSelector from "../components/controls/ScenarioSelector";
import MetricSelector from "../components/controls/MetricSelector";
import LTISMap from "../components/map/LTISMap";
import SummaryCards from "../components/dashboard/SummaryCards";
import LocalProfile from "../components/dashboard/LocalProfile";
import RankingChart from "../components/dashboard/RankingChart";

import SmallMultiples from "../features/compare/SmallMultiples";
import LorenzCurve from "../features/distribution/LorenzCurve";
import ResilienceRadar from "../features/profile/ResilienceRadar";
import { getFallbackProfile, getBaselineBundle } from "../data/schema";

/**
 * Free-exploration dashboard. Composes the existing map / summary / profile /
 * ranking with the new SmallMultiples (cross-scenario comparison),
 * ResilienceRadar (fulfils PPT slide 11) and LorenzCurve (distributional
 * inequality view).
 */
export default function ExploreRoute() {
  const { lsoaData, scenarioSummary } = useLTISDataContext();
  const {
    scenario,
    setScenario,
    metric,
    setMetric,
    selectedFeature,
    setSelectedFeature,
    hoveredFeature,
    setHoveredFeature,
  } = useLTISState();

  const focusFeature = selectedFeature ?? hoveredFeature;
  const profile = focusFeature
    ? getFallbackProfile(focusFeature.properties, scenario)
    : null;
  const baselineProfile = focusFeature
    ? // For the radar baseline overlay, reuse the baseline-bundle's optional
      // profile when present; for skeleton fall back to a flat 0.5 profile.
      ({
        redundancy: getBaselineBundle(focusFeature.properties).modeDiversity ?? 0.5,
        busFallback: 0.5,
        cycleFallback: getBaselineBundle(focusFeature.properties).microMobility ?? 0.5,
        modalDiversity: getBaselineBundle(focusFeature.properties).modeDiversity ?? 0.5,
        dependencyRisk: 0.5,
      } as const)
    : null;

  return (
    <section className="analytics-shell" id="explore">
      <div className="analytics-header">
        <div>
          <p className="eyebrow">Interactive scenario explorer</p>
          <h2>Explore disruption vulnerability across London</h2>
          <p className="section-intro">
            Select a disruption scenario and a map metric to inspect where
            mobility is retained, where accessibility is lost, and which
            neighbourhoods become more exposed.
          </p>
        </div>

        <div className="control-stack">
          <ScenarioSelector scenario={scenario} onScenarioChange={setScenario} />
          <MetricSelector metric={metric} onMetricChange={setMetric} />
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="map-card">
          <LTISMap
            data={lsoaData}
            scenario={scenario}
            metric={metric}
            selectedFeature={selectedFeature}
            onSelectFeature={setSelectedFeature}
            onHoverFeature={setHoveredFeature}
          />
        </div>

        <aside className="side-panel">
          <SummaryCards summary={scenarioSummary[scenario]} />
          <LocalProfile feature={focusFeature} scenario={scenario} />

          {profile ? (
            <div className="surface" style={{ padding: "var(--space-5)" }}>
              <ResilienceRadar
                profile={profile}
                baseline={baselineProfile ?? undefined}
                title="Local fallback profile"
              />
            </div>
          ) : null}
        </aside>
      </div>

      <div className="chart-grid">
        <RankingChart
          data={lsoaData}
          scenario={scenario}
          metric={metric}
          onSelectFeature={setSelectedFeature}
        />
      </div>

      <div style={{ marginTop: "var(--space-12)" }}>
        <SmallMultiples
          data={lsoaData}
          metric={metric}
          activeScenario={scenario}
          onSelectScenario={setScenario}
        />
      </div>

      <div style={{ marginTop: "var(--space-12)" }}>
        <LorenzCurve data={lsoaData} scenario={scenario} metric={metric} />
      </div>
    </section>
  );
}
