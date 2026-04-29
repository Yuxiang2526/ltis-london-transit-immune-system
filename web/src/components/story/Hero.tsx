import { Link } from "react-router-dom";
import MetricCard from "../ui/MetricCard";
import { useLTISDataContext } from "../../data/dataContext";
import { ALL_SCENARIO_IDS } from "../../data/scenarios";

/**
 * Editorial hero. Big serif headline + lede + animated headline metrics
 * (count-up on scroll-in) + scroll indicator. The metrics are derived from
 * the live dataset so they reflect whatever pipeline output is loaded.
 */
export default function Hero() {
  const { lsoaData, scenarioSummary } = useLTISDataContext();

  const lsoaCount = lsoaData?.features.length ?? 0;
  const scenarioCount = ALL_SCENARIO_IDS.length;
  const totalExposed = scenarioSummary
    ? Math.max(
        ...ALL_SCENARIO_IDS.map(
          (id) => scenarioSummary[id]?.totalExposedPopulation ?? 0,
        ),
      )
    : 0;

  return (
    <section className="hero">
      <div className="hero-content">
        <p className="eyebrow">London Transit Immune System</p>
        <h1>
          When London's transport network is disrupted, who still has a way out?
        </h1>
        <p className="hero-subtitle">
          LTIS maps fallback mobility across London neighbourhoods by comparing
          baseline accessibility (PTAL 2023) with three Underground line
          disruption scenarios — and asks how unevenly resilience is
          distributed.
        </p>

        <div className="hero-stats">
          <MetricCard
            label="London LSOAs covered"
            value={lsoaCount}
            decimals={0}
            note="2021 ONS boundaries"
            highlight
          />
          <MetricCard
            label="Disruption scenarios"
            value={scenarioCount}
            decimals={0}
            note="Central · Northern · Jubilee"
          />
          <MetricCard
            label="Peak exposed residents"
            value={totalExposed}
            decimals={0}
            note="Worst-case scenario, person-equivalent"
          />
        </div>

        <Link to="/explore" className="hero-cta" style={{ marginTop: "var(--space-8)" }}>
          Explore disruption scenarios →
        </Link>
        <span className="hero-scroll-indicator">Scroll for the story</span>
      </div>
    </section>
  );
}
