import { useEffect, useRef } from "react";
import { useRouteRankings } from "../features/rankings/useRouteRankings";

const NETWORK_MAP_HTML = `${import.meta.env.BASE_URL}network-map/London_PTAL_Accessibility_Map.html`;

/**
 * Embed-mode CSS injected into Siyan's iframe at runtime.
 *
 * Hides the brand title, legend, info-panel, AND the map-toolbar (we
 * replicate the useful buttons in the React parent below the iframe).
 * Keeps the .controls panel as a right-column sidebar inside the iframe
 * because we wire those controls to Siyan's exposed window functions.
 */
const EMBED_CSS = `
  /* --- Hide elements we relocate to the React parent --- */
  body .brand { display: none !important; }
  body .legend { display: none !important; }
  body #info-panel { display: none !important; }
  body .map-toolbar { display: none !important; }

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
        if (doc.getElementById("ltis-embed-style")) return;
        const style = doc.createElement("style");
        style.id = "ltis-embed-style";
        style.textContent = EMBED_CSS;
        doc.head.appendChild(style);
        doc.body.classList.add("ltis-embed-mode");
      } catch (err) {
        console.warn("[LTIS] Could not inject embed CSS into iframe:", err);
      }
    };

    iframe.addEventListener("load", injectStyles);
    if (iframe.contentDocument?.readyState === "complete") injectStyles();

    return () => iframe.removeEventListener("load", injectStyles);
  }, []);

  /**
   * Call a Siyan-exposed window function inside the iframe. The function
   * names (clearCancelledRoutes, zoomToSelectedFeature, etc.) are declared
   * as `window.fn = fn` in her HTML, so they're directly accessible from
   * our same-origin parent.
   */
  const callIframeFn = (fnName: string) => {
    const w = iframeRef.current?.contentWindow as
      | (Window & Record<string, unknown>)
      | null;
    const fn = w?.[fnName];
    if (typeof fn === "function") (fn as () => void)();
  };

  return (
    <section className="network-route" aria-label="Detailed network resilience explorer">
      {/* ───── Hero band ───── */}
      <header className="network-route__hero">
        <div className="network-route__hero-text">
          <p className="eyebrow">LTRS · Companion tool by Siyan Tao</p>
          <h2>London Public Transport Resilience</h2>
          <p className="network-route__hero-blurb">
            Real OSM-Dijkstra walking-time model on every 100 m grid cell in
            Greater London. Use the Scenario Builder on the right of the map
            to cancel any of 543 routes; the map below recomputes live.
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

      {/* ───── Map iframe (full width, with internal Scenario Builder) ───── */}
      <div className="network-route__frame network-route__frame--full">
        <iframe
          ref={iframeRef}
          src={NETWORK_MAP_HTML}
          title="LTRS Network Map — interactive PTAL resilience explorer"
          loading="lazy"
          className="network-iframe"
          allow="fullscreen"
        />
      </div>

      {/* ───── Action bar: replicates the iframe's hidden map-toolbar ───── */}
      <div className="network-route__actionbar">
        <button
          type="button"
          className="network-route__action-btn"
          onClick={() => callIframeFn("zoomToSelectedFeature")}
        >
          <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" aria-hidden="true">
            <circle cx="11" cy="11" r="6" />
            <path d="M16 16l4.5 4.5" strokeLinecap="round" />
          </svg>
          Zoom to selection
        </button>
        <button
          type="button"
          className="network-route__action-btn network-route__action-btn--danger"
          onClick={() => callIframeFn("clearCancelledRoutes")}
        >
          <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" aria-hidden="true">
            <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M6 6v14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6" />
          </svg>
          Reset all cancelled routes
        </button>
        <span className="network-route__action-hint muted">
          Tip · click any 100 m grid cell, then cancel a route on the right.
        </span>
      </div>

      {/* ───── Horizontal info grid below the map ───── */}
      <div className="network-route__info-grid">
        <section className="network-route__panel network-route__panel--legend">
          <p className="eyebrow">Map legend</p>
          <div className="ptal-legend-cols">
            <div>
              <h4 className="ptal-legend-col-title">PTAL band</h4>
              <ul className="ptal-legend-list">
                {PTAL_BANDS.map((b) => (
                  <li key={b.label}>
                    <span className="ptal-swatch" style={{ background: b.color }} />
                    <span>{b.label}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="ptal-legend-col-title">Disrupted side</h4>
              <ul className="ptal-legend-list">
                {AI_DROP_BANDS.map((b) => (
                  <li key={b.label}>
                    <span
                      className="ptal-swatch"
                      style={{
                        background: b.color,
                        border: b.color === "#ffffff" ? "1px solid #ccc" : "",
                      }}
                    />
                    <span>{b.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="network-route__panel network-route__panel--accent">
          <p className="eyebrow">At a glance</p>
          <ul className="network-route__stats network-route__stats--big">
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
          <p className="eyebrow">How to use</p>
          <ol className="network-route__steps">
            <li>
              <strong>Pick a 100 m cell</strong> by clicking the map, or jump
              to a borough or postcode in the right-column Scenario Builder.
            </li>
            <li>
              <strong>Cancel routes</strong> from the searchable list (Tube,
              Overground, DLR, Tramlink, or any of 540+ buses).
            </li>
            <li>
              <strong>Read the AI drop</strong> on the disrupted side (right
              of the split divider).
            </li>
          </ol>
        </section>
      </div>
    </section>
  );
}

const PTAL_BANDS: { label: string; color: string }[] = [
  { label: "0 — very poor",   color: "#106E80" },
  { label: "1a",              color: "#317CB7" },
  { label: "1b",              color: "#6DADE1" },
  { label: "2",               color: "#B6D7E8" },
  { label: "3",               color: "#E9F1F4" },
  { label: "4",               color: "#FBE3D5" },
  { label: "5",               color: "#F6B293" },
  { label: "6a",              color: "#DC6D57" },
  { label: "6b — excellent",  color: "#B72230" },
];

const AI_DROP_BANDS: { label: string; color: string }[] = [
  { label: "0–5 % · virtually no impact", color: "#ffffff" },
  { label: "5–15 % · slight",             color: "#ffe5e5" },
  { label: "15–30 % · moderate",          color: "#ffb3b3" },
  { label: "30–50 % · significant",       color: "#ff6666" },
  { label: "50–70 % · severe",            color: "#e63333" },
  { label: ">70 % · critical",            color: "#b30000" },
];
