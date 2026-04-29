/**
 * NetworkRoute
 * ------------
 * Full-bleed wrapper around Siyan Tao's PTAL Resilience Map.
 *
 * The embedded HTML application is the second of LTIS's two complementary
 * analytical tools:
 *
 *   - LTIS (this React site, /explore) — neighbourhood-level composite
 *     resilience score using a simplified PTAL + dependency model. Optimised
 *     for storytelling and city-wide overview.
 *
 *   - LTRS Network Map (this iframe, /network) — 100m grid-cell resilience
 *     under multi-route disruption, computed via OSM road-network Dijkstra
 *     shortest-path with 4.8 km/h walking speed and a 2.4 km cap. Optimised
 *     for forensic, route-by-route inspection.
 *
 * The iframe owns its own MapBox map, state and 27,553-stop walking
 * accessibility model. We just give it a viewport.
 */

const NETWORK_MAP_HTML = `${import.meta.env.BASE_URL}network-map/London_PTAL_Accessibility_Map.html`;

export default function NetworkRoute() {
  return (
    <section className="network-route" aria-label="Detailed network resilience explorer">
      <header className="network-route__intro">
        <p className="eyebrow">Companion tool</p>
        <h2>LTRS — 100 m grid network resilience explorer</h2>
        <p className="muted" style={{ maxWidth: "62ch" }}>
          A high-resolution counterpart to the LSOA-level LTIS view. Cancel one or
          more transport routes (Underground, Overground, Elizabeth, DLR, Tramlink
          and 540+ bus routes) and see how the AI score changes per 100 m grid
          cell. Walking accessibility is computed on the OSM road network with
          Dijkstra shortest paths, capped at 2,400 m. By Siyan Tao.
        </p>
      </header>

      <div className="network-route__frame">
        <iframe
          src={NETWORK_MAP_HTML}
          title="LTRS Network Map — interactive PTAL resilience explorer"
          loading="lazy"
          className="network-iframe"
          allow="fullscreen"
        />
      </div>
    </section>
  );
}