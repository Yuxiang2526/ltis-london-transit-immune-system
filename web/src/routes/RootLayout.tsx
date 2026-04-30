import { Outlet, ScrollRestoration } from "react-router-dom";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import { useLTISData } from "../hooks/useLTISData";
import { LTISDataContext } from "../data/dataContext";

/**
 * App shell. Loads the dataset once at the root, exposes it via context to
 * every route, and handles top-level loading + error states. The loading
 * state renders a hero-shaped skeleton so the perceived first paint is fast
 * even while the 8.9 MB LSOA GeoJSON is being parsed.
 */
export default function RootLayout() {
  const { lsoaData, scenarioSummary, loading, error } = useLTISData();

  return (
    <div className="app">
      <a className="skip-link" href="#main">Skip to main content</a>
      <Header />

      <main id="main">
        {loading ? (
          <AppLoadingSkeleton />
        ) : error || !lsoaData || !scenarioSummary ? (
          <div className="app-error">
            <h1>Data loading error</h1>
            <p>{error ?? "Unknown error"}</p>
          </div>
        ) : (
          <LTISDataContext.Provider
            value={{ lsoaData: lsoaData!, scenarioSummary: scenarioSummary! }}
          >
            <Outlet />
          </LTISDataContext.Provider>
        )}
      </main>

      <Footer />
      <ScrollRestoration />
    </div>
  );
}

function AppLoadingSkeleton() {
  return (
    <div className="app-loading-skeleton" aria-busy="true" aria-live="polite">
      <div className="hero" style={{ minHeight: "70vh" }}>
        <div className="hero-content">
          <p className="eyebrow">London Transit Resilience System</p>
          <div className="skeleton skeleton--title" />
          <div className="skeleton skeleton--paragraph" />
          <div className="skeleton skeleton--paragraph short" />
          <div className="hero-stats">
            <div className="skeleton skeleton--card" />
            <div className="skeleton skeleton--card" />
            <div className="skeleton skeleton--card" />
          </div>
          <p className="muted" style={{ marginTop: "var(--space-8)" }}>
            Loading 4,994 London neighbourhoods...
          </p>
        </div>
      </div>
    </div>
  );
}
