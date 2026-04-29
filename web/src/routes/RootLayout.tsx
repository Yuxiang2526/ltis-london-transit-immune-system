import { Outlet, ScrollRestoration } from "react-router-dom";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import { useLTISData } from "../hooks/useLTISData";
import { LTISDataContext } from "../data/dataContext";

/**
 * App shell. Loads the dataset once at the root, exposes it via context to
 * every route, and handles top-level loading + error states.
 */
export default function RootLayout() {
  const { lsoaData, scenarioSummary, loading, error } = useLTISData();

  return (
    <div className="app">
      <a className="skip-link" href="#main">Skip to main content</a>
      <Header />

      <main id="main">
        {loading ? (
          <div className="app-loading">
            <p>Loading London Transit Immune System...</p>
          </div>
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
