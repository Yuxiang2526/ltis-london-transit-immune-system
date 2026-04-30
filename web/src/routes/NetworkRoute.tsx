import { useEffect, useRef } from "react";
import { useRouteRankings } from "../features/rankings/useRouteRankings";

const NETWORK_MAP_HTML = `${import.meta.env.BASE_URL}network-map/London_PTAL_Accessibility_Map.html`;

/**
 * Embed-mode CSS injected into Siyan's iframe at runtime.
 *
 * Hides the brand title and legend (we render replicas in the React parent
 * so they are not overlaying the map) and turns the Scenario Builder from
 * an absolute overlay into a proper right-column sidebar that takes a
 * dedicated 360 px column. The map itself fills the remaining left area.
 *
 * This is structural CSS only — no functional code is changed in Siyan's
 * HTML. In standalone usage (without the LTIS wrapper) the original layout
 * is unaffected because we only touch iframe.contentDocument at runtime.
 */
const EMBED_CSS = `
  /* --- Hide elements we relocate to the React parent --- */
  body .brand { display: none !important; }
  body .legend { display: none !important; }
  body #info-panel { display: none !important; }

  /* --- Make the map area share the body with a right-column controls panel --- */
  body { overflow: hidden !important; }

  body #map,
  body #map-compare,
  body #split-divider {
    right: 360px !important;
  }

  /* --- Controls panel: full-height right column, not an overlay --- */
  body .controls {
    top: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    width: 360px !important;
    max-height: none !important;
    height: 100vh !important;
    border-radius: 0 !important;
    border-left: 1px solid var(--line, #d8dee4) !important;
    border-right: 0 !important;
    border-top: 0 !important;
    border-bottom: 0 !important;
    box-shadow: none !important;
    padding: 0 !important;
  }
  body .controls .controls-body {
    max-height: calc(100vh - 64px) !important;
  }

  /* --- Map toolbar: anchor inside the now-narrower map area --- */
  body .map-toolbar {
    right: auto !important;
    left: 18px !important;
    top: auto !important;
    bottom: 18px !important;
  }

  /* Compare label adjustments so they sit above the map area, not the panel. */
  body #compare-label-right { right: calc(360px + 18px) !important; }
`;

export default function NetworkRoute() {
  const { data } = useRouteRankings();
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // Inject embed-mode CSS into the iframe once it loads. Safe — same origin.
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const injectStyles = () => {
      try {
        const doc = iframe.contentDocument;
        if (!doc) return;
        // Don't inject twice.
        if (doc.getElementById("ltis-embed-style")) return;
        const style = doc.createElement("style");
        style.id = "ltis-embed-style";
        style.textContent = EMBED_CSS;
        doc.head.appendChild(style);
        doc.body.classList.add("ltis-embed-mode");
      } catch (err) {
        // Cross-origin or timing issue — non-fatal.
        console.warn("[LTIS] Could not inject embed CSS into iframe:", err);
      }
    };

    iframe.addEventListener("load", injectStyles);
    // Try immediately too — if iframe already loaded (HMR / cache).
    if (iframe.contentDocument?.readyState === "complete") injectStyles();

    return () => iframe.removeEventListener("load", injectStyles);
  }, []);

  return (
    <section className="network-route" aria-label="Detailed network resilience explorer">
      {/* ───── Hero band ───── */}
      <header className="network-route__hero">
        <div className="network-route__hero-text">
          <p className="eyebrow">LTRS · Companion tool by Siyan Tao</p>
          <h2>London Public Transport Resilience</h2>
          <p className="network-route__hero-blurb">
            Real OSM-Dijkstra walking-time model on every 100 m grid cell in
            Greater London. Cancel any of 543 routes and see the impact
            recompute live. The Scenario Builder is on the right of the map;
            for the most comfortable experience, open the full-screen version.
          </p>
        </div>
        <a
          className="network-route__open-fullscreen"
          href={NETWORK_MAP_HTML}
          target="_blank"
          rel="noreferrer"
          title="Open the full-screen Network Map in a new tab"
        >
          <span>Open full-screen</span>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 3h7v7M21 3l-9 9M21 14v7h-7M3 10V3h7M3 21l9-9" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </header>

      {/* ───── Embedded iframe + side panel ───── */}
      <div className="network-route__split">
        <div className="network-route__frame">
          <iframe
            ref={iframeRef}
            src={NETWORK_MAP_HTML}
            title="LTRS Network Map — interactive PTAL resilience explorer"
            loading="lazy"
            className="network-iframe"
            allow="fullscreen"
          />
        </div>

        <aside className="network-route__sidebar" aria-label="Network Map context">
          {/* PTAL legend — replicated outside the iframe */}
          <section className="network-route__panel network-route__panel--legend">
            <p className="eyebrow">Map legend</p>
            <h3>PTAL accessibility band</h3>
            <ul className="ptal-legend-list">
              {PTAL_BANDS.map((b) => (
                <li key={b.label}>
                  <span className="ptal-swatch" style={{ background: b.color }} />
                  <span>{b.label}</span>
                </li>
              ))}
            </ul>
            <hr className="network-route__panel-divider" />
            <p className="eyebrow">Disrupted side</p>
            <ul className="ptal-legend-list">
              {AI_DROP_BANDS.map((b) => (
                <li key={b.label}>
                  <span className="ptal-swatch" style={{ background: b.color, border: b.color === "#ffffff" ? "1px solid #ccc" : "" }} />
                  <span>{b.label}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="network-route__panel network-route__panel--accent">
            <p className="eyebrow">At a glance</p>
            <ul className="network-route__stats">
              <li>
                <strong className="num-mono">543</strong>
                <span>routes</span>
              </li>
              <li>
                <strong className="num-mono">159 k</strong>
                <span>100 m cells</span>
              </li>
              <li>
                <strong className="num-mono">27 553</strong>
                <span>transit stops</span>
              </li>
              <li>
                <strong className="num-mono">2 400 m</strong>
                <span>walking budget</span>
              </li>
            </ul>
          </section>

          <section className="network-route__panel">
            <p className="eyebrow">Top 5 disruptive routes</p>
            <ol className="network-route__top-list">
              {(data?.top5 ?? []).map((r, i) => (
                <li key={r.route}>
                  <span className="network-route__top-rank num-mono">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="network-route__top-route num-mono">{r.route}</span>
                  <span className="network-route__top-metric">
                    {r.lost12minAccessLsoa} LSOAs
                  </span>
                </li>
              ))}
            </ol>
          </section>

          <section className="network-route__panel">
            <p className="eyebrow">How to use the Scenario Builder</p>
            <ol className="network-route__steps">
              <li>
                <strong>Pick a 100 m grid cell</strong> by clicking the map, or
                jump to a borough / postcode in the right-column panel inside
                the map.
              </li>
              <li>
                <strong>Cancel routes</strong> from the searchable list — Tube
                line, Overground branch, bus, or any combination.
              </li>
              <li>
                <strong>Read the AI drop</strong> on the disrupted side
                (right of the split divider).
              </li>
            </ol>
          </section>
        </aside>
      </div>
    </section>
  );
}

/** PTAL bands — colours matched to Siyan's HTML legend. */
const PTAL_BANDS: { label: string; color: string }[] = [
  { label: "0 — very poor", color: "#106E80" },
  { label: "1a",            color: "#317CB7" },
  { label: "1b",            color: "#6DADE1" },
  { label: "2",             color: "#B6D7E8" },
  { label: "3",             color: "#E9F1F4" },
  { label: "4",             color: "#FBE3D5" },
  { label: "5",             color: "#F6B293" },
  { label: "6a",            color: "#DC6D57" },
  { label: "6b — excellent", color: "#B72230" },
];

const AI_DROP_BANDS: { label: string; color: string }[] = [
  { label: "0–5 % · virtually no impact", color: "#ffffff" },
  { label: "5–15 % · slight",             color: "#ffe5e5" },
  { label: "15–30 % · moderate",          color: "#ffb3b3" },
  { label: "30–50 % · significant",       color: "#ff6666" },
  { label: "50–70 % · severe",            color: "#e63333" },
  { label: ">70 % · critical",            color: "#b30000" },
];
