import { useRouteRankings } from "../features/rankings/useRouteRankings";

const NETWORK_MAP_HTML = `${import.meta.env.BASE_URL}network-map/London_PTAL_Accessibility_Map.html`;

/**
 * NetworkRoute
 * ------------
 * The forensic LTRS Network Map by Siyan Tao, embedded as an iframe.
 *
 * Layout: 2-column grid — iframe on the left (~65 %), context sidebar on
 * the right (~35 %) with usage instructions, key statistics and the live
 * top-5 routes list. A prominent "Open full-screen" CTA at the top opens
 * Siyan's standalone HTML in a new tab so the panels inside the iframe
 * can have full-page real estate when the user wants it.
 */
export default function NetworkRoute() {
  const { data } = useRouteRankings();

  return (
    <section className="network-route" aria-label="Detailed network resilience explorer">
      {/* ───── Hero band ───── */}
      <header className="network-route__hero">
        <div className="network-route__hero-text">
          <p className="eyebrow">LTRS · Companion tool by Siyan Tao</p>
          <h2>Cancel any of 543 routes. Watch 159 k cells recompute.</h2>
          <p className="network-route__hero-blurb">
            Real OSM-Dijkstra walking-time model on every 100 m grid cell in
            Greater London. The map is interactive — but for the most
            comfortable experience, open the full-screen version.
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
            src={NETWORK_MAP_HTML}
            title="LTRS Network Map — interactive PTAL resilience explorer"
            loading="lazy"
            className="network-iframe"
            allow="fullscreen"
          />
        </div>

        <aside className="network-route__sidebar" aria-label="How to read the Network Map">
          <section className="network-route__panel">
            <p className="eyebrow">How to read this</p>
            <h3>The map's three modes</h3>
            <ol className="network-route__steps">
              <li>
                <strong>Pick a 100 m grid cell</strong> by clicking anywhere on
                the map, or jump to a borough / postcode in the right panel.
              </li>
              <li>
                <strong>Cancel routes</strong> from the searchable list — pick
                a Tube line, an Overground branch, a bus, or any combination.
              </li>
              <li>
                <strong>Read the AI drop</strong> on the disrupted side
                (right of the split). Numbers update instantly.
              </li>
            </ol>
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
            <p className="muted" style={{ fontSize: "var(--text-xs)" }}>
              Click any route in the iframe's "Cancel routes" list to model it.
            </p>
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
        </aside>
      </div>
    </section>
  );
}
