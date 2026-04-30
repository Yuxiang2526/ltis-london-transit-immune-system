import { Link } from "react-router-dom";
import { useState } from "react";

import { useLTISDataContext } from "../data/dataContext";

import LTISMap from "../components/map/LTISMap";
import LocalProfile from "../components/dashboard/LocalProfile";
import LorenzCurve from "../features/distribution/LorenzCurve";
import DistributionPanel from "../features/distribution/DistributionPanel";
import DecileBars from "../features/distribution/DecileBars";
import SectionHeader from "../components/ui/SectionHeader";
import Reveal from "../components/ui/Reveal";

import RouteRankCards from "../features/rankings/RouteRankCards";
import ImpactMatrix from "../features/rankings/ImpactMatrix";
import HeadlineStrip from "../features/rankings/HeadlineStrip";

import type { LSOAFeature } from "../data/schema";
import { DEFAULT_SCENARIO_ID } from "../data/scenarios";

/**
 * Explorer (LSOA narrative overview)
 * ----------------------------------
 * Composed of three editorial blocks:
 *
 *   1. Findings — "Five routes that matter most" rank cards + Impact matrix
 *      heatmap. Pulled from Siyan's resilience_summary_osm_network.json
 *      (route_rankings.json), rendered with the project palette.
 *
 *   2. Map + LocalProfile — the LSOA-level baseline accessibility choropleth
 *      with a side panel that updates on hover/click.
 *
 *   3. Distribution — Lorenz curve of the baseline distribution (one
 *      number — the Gini — that sums up the spatial inequality argument).
 *
 *   4. CTA into the forensic Network Map.
 */
export default function ExploreRoute() {
  const { lsoaData } = useLTISDataContext();
  const [selectedFeature, setSelectedFeature] = useState<LSOAFeature | null>(null);
  const [hoveredFeature, setHoveredFeature] = useState<LSOAFeature | null>(null);
  const focusFeature = selectedFeature ?? hoveredFeature;

  return (
    <section className="analytics-shell" id="explore">
      {/* ───── Headline numbers strip ───── */}
      <Reveal>
        <HeadlineStrip />
      </Reveal>

      {/* ───── Section: rank cards ───── */}
      <Reveal delay={0.04}>
        <div style={{ marginTop: "var(--space-12)" }}>
          <SectionHeader
            badge="01"
            tone="warm"
            eyebrow="Routes ranking · top 5"
            title="Five routes that matter most — and why."
            description="Across 418 regular London routes, these five strip the most neighbourhoods of their 12-minute walking access when cancelled. Every winner is an outer-London route — places where alternatives are scarce."
          />
          <RouteRankCards />
        </div>
      </Reveal>

      {/* ───── Section: impact matrix ───── */}
      <Reveal delay={0.08}>
        <div style={{ marginTop: "var(--space-16)" }}>
          <SectionHeader
            badge="02"
            tone="warm"
            eyebrow="Impact matrix · top 10 × four metrics"
            title="One row, one route. Four ways the city loses."
            description="Each cell is normalised across all 418 regular London routes — darker terracotta means a larger relative impact on that metric. Reading horizontally tells you a route's signature; reading vertically tells you which routes dominate that dimension."
          />
          <ImpactMatrix />
        </div>
      </Reveal>

      {/* ───── Section: Map + Local profile (cool palette) ───── */}
      <Reveal delay={0.1}>
        <div style={{ marginTop: "var(--space-16)" }}>
          <SectionHeader
            badge="03"
            tone="cool"
            eyebrow="LSOA baseline accessibility"
            title="Hover any neighbourhood, inspect its profile."
            description="The choropleth shows the percentile rank of each LSOA's baseline accessibility. Hover or click any LSOA to drill into its profile."
          />

          <div className="dashboard-grid">
            <div className="map-card">
              <LTISMap
                data={lsoaData}
                scenario={DEFAULT_SCENARIO_ID}
                metric="baseline_ltis"
                selectedFeature={selectedFeature}
                onSelectFeature={setSelectedFeature}
                onHoverFeature={setHoveredFeature}
              />
            </div>
            <aside className="side-panel">
              <LocalProfile
                feature={focusFeature}
                scenario={DEFAULT_SCENARIO_ID}
                onSelectFeature={setSelectedFeature}
              />
            </aside>
          </div>
        </div>
      </Reveal>

      {/* ───── Section: Distribution (cool palette) ───── */}
      <Reveal delay={0.12}>
        <div style={{ marginTop: "var(--space-16)" }}>
          <SectionHeader
            badge="04"
            tone="cool"
            eyebrow="Distributional concentration"
            title="Where loss accumulates — quantified."
            description="Three complementary views of the same accessibility distribution: a Lorenz curve, the headline shares, and decile bars. Read them together."
          />

          {/* Lorenz curve + distribution stats panel side by side */}
          <div className="distribution-grid">
            <LorenzCurve
              data={lsoaData}
              scenario={DEFAULT_SCENARIO_ID}
              metric="baseline_ltis"
            />
            <DistributionPanel />
          </div>

          {/* Decile bars below */}
          <div style={{ marginTop: "var(--space-6)" }}>
            <DecileBars />
          </div>
        </div>
      </Reveal>

      {/* ───── CTA to Network Map ───── */}
      <Reveal delay={0.14}>
        <div className="story-cta" style={{ marginTop: "var(--space-16)" }}>
          <div>
            <p className="eyebrow">Want full control?</p>
            <h2>Switch to the Network Map for 543 routes &amp; 100 m grids</h2>
            <p className="muted">
              The LTRS Network Map lets you cancel any combination of routes,
              navigate to any borough or postcode, and inspect resilience at
              100 m grid resolution. This Explorer is the LSOA-scale narrative
              overview; the Network Map is the forensic tool.
            </p>
          </div>
          <Link to="/network" className="hero-cta">
            Open the Network Map →
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
