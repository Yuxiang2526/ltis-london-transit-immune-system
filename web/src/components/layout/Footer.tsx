import { Link } from "react-router-dom";

/**
 * Multi-column site footer with project blurb, navigation, and data credits.
 * The bottom strip carries licence + AI declaration.
 */
export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-grid">
        <section>
          <h4>London Transit Immune System</h4>
          <p>
            A neighbourhood-scale resilience explorer for London, built around
            two complementary analytical layers: the LSOA-level LTIS composite
            and the 100 m-grid LTRS Dijkstra network model. Built for CASA0029
            Urban Data Visualisation, 2025/26 (Group 17). Open source and
            reproducible from public data only.
          </p>
        </section>

        <section>
          <h4>Site</h4>
          <ul>
            <li><Link to="/">Story</Link></li>
            <li><Link to="/explore">Explorer</Link></li>
            <li><Link to="/network">Network Map</Link></li>
            <li><Link to="/methodology">Methodology</Link></li>
            <li><Link to="/about">About</Link></li>
          </ul>
        </section>

        <section>
          <h4>Data &amp; credits</h4>
          <ul>
            <li>PTAL 2023 &copy; Transport for London</li>
            <li>LSOA 2021 boundaries &copy; ONS</li>
            <li>NaPTAN &copy; Department for Transport (OGL v3)</li>
            <li>OSM walking network &copy; OpenStreetMap contributors (ODbL)</li>
            <li>Basemaps &copy; CARTO &copy; Mapbox</li>
            <li>
              <a href="https://github.com/" target="_blank" rel="noreferrer">
                Source code (GitHub)
              </a>
            </li>
          </ul>
        </section>
      </div>

      <div className="site-footer-bottom">
        <span>MIT licensed &middot; code, data and methodology open</span>
        <span>AI-tool usage itemised on the About page</span>
      </div>
    </footer>
  );
}
