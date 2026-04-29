import { Link } from "react-router-dom";

/**
 * Multi-column site footer in the editorial reference-project style:
 * a project blurb, navigation column, data/credits column, with a
 * licence + AI strip across the bottom.
 */
export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-grid">
        <section>
          <h4>London Transit Immune System</h4>
          <p>
            A neighbourhood-scale resilience explorer for London. Built for
            CASA0029 Urban Data Visualisation, 2025/26 (Group 17). Open source
            and reproducible from public data only.
          </p>
        </section>

        <section>
          <h4>Site</h4>
          <ul>
            <li><Link to="/">Story</Link></li>
            <li><Link to="/explore">Explorer</Link></li>
            <li><Link to="/methodology">Methodology</Link></li>
            <li><Link to="/about">About</Link></li>
          </ul>
        </section>

        <section>
          <h4>Data &amp; credits</h4>
          <ul>
            <li>PTAL 2023 æ¼ Transport for London</li>
            <li>LSOA 2021 boundaries æ¼ ONS</li>
            <li>NaPTAN æ¼ Department for Transport (OGL v3)</li>
            <li>Map æ¼ OpenStreetMap contributors æ¼ CARTO</li>
            <li>
              <a href="https://github.com/" target="_blank" rel="noreferrer">
                Source code (GitHub)
              </a>
            </li>
          </ul>
        </section>
      </div>

      <div className="site-footer-bottom">
        <span>MIT licensed è·¯ code, data and methodology open</span>
        <span>AI-tool usage itemised on the About page</span>
      </div>
    </footer>
  );
}
