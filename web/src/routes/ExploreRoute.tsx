import { Link } from "react-router-dom";
import { useState } from "react";

import { useLTISDataContext } from "../data/dataContext";

import LTISMap from "../components/map/LTISMap";
import LocalProfile from "../components/dashboard/LocalProfile";
import LorenzCurve from "../features/distribution/LorenzCurve";

import type { LSOAFeature } from "../data/schema";
import { DEFAULT_SCENARIO_ID } from "../data/scenarios";
import SectionHeader from "../components/ui/SectionHeader";

/**
 * Explorer (LSOA narrative overview)
 * ----------------------------------
 * A simplified middle layer between the Story scrollytelling and the
 * forensic LTRS Network Map. Scope is intentionally narrow:
 *
 *   - Show the baseline accessibility choropleth at LSOA scale
 *   - Let the user click any LSOA to inspect its profile and per-scenario
 *     retention against the three reference routes (99, R2, 685)
 *   - Show a Lorenz curve of the baseline distribution to make the
 *     concentration argument quantitative
 *   - Link out to /network for the full 543-route cancel-and-recompute tool
 *
 * Per the project decision (D2 2026-04-30) the explorer no longer ships a
 * scenario selector. If you want to switch scenarios live, that's exactly
 * what the Network Map at /network is for.
 */
export default function ExploreRoute() {
  const { lsoaData } = useLTISDataContext();
  const [selectedFeature, setSelectedFeature] = useState<LSOAFeature | null>(null);
  const [hoveredFeature, setHoveredFeature] = useState<LSOAFeature | null>(null);
  const focusFeature = selectedFeature ?? hoveredFeature;

  return (
    <section className="analytics-shell" id="explore">
      <SectionHeader
        eyebrow="LSOA narrative overview"
        title="Explore the baseline — then go forensic"
        description="The map shows London's baseline accessibility (AI) at LSOA scale. Hover or click any neighbourhood to inspect its local profile. For full route-by-route disruption modelling, open the Network Map."
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
          <LocalProfile feature={focusFeature} scenario={DEFAULT_SCENARIO_ID} />
        </aside>
      </div>

      <div style={{ marginTop: "var(--space-12)" }}>
        <LorenzCurve
          data={lsoaData}
          scenario={DEFAULT_SCENARIO_ID}
          metric="baseline_ltis"
        />
      </div>

      <div className="story-cta" style={{ marginTop: "var(--space-12)" }}>
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
    </section>
  );
}
