import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";

import RootLayout from "./RootLayout";
import StoryRoute from "./StoryRoute";

/**
 * Routes that are not on the critical first-paint path are loaded lazily so
 * the initial bundle stays small. StoryRoute is the index route, so it stays
 * in the main bundle; Explorer / Network / Methodology / About are split off
 * (Methodology in particular pulls in KaTeX, which is large).
 *
 * `BASE_URL` honours Vite's `base` config (set when deploying to GitHub Pages
 * under a subpath). All in-app navigation uses <Link>/<NavLink>, so this is
 * the only place that needs to know about the deployed prefix.
 */

const ExploreRoute = lazy(() => import("./ExploreRoute"));
const NetworkRoute = lazy(() => import("./NetworkRoute"));
const MethodologyRoute = lazy(() => import("./MethodologyRoute"));
const AboutRoute = lazy(() => import("./AboutRoute"));

function RouteLoadingFallback() {
  return (
    <div className="route-loading">
      <div className="route-loading__spinner" aria-hidden="true" />
      <p className="muted">Loading…</p>
    </div>
  );
}

function withSuspense(node: React.ReactNode) {
  return <Suspense fallback={<RouteLoadingFallback />}>{node}</Suspense>;
}

export const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <RootLayout />,
      children: [
        { index: true, element: <StoryRoute /> },
        { path: "explore", element: withSuspense(<ExploreRoute />) },
        { path: "network", element: withSuspense(<NetworkRoute />) },
        { path: "methodology", element: withSuspense(<MethodologyRoute />) },
        { path: "about", element: withSuspense(<AboutRoute />) },
      ],
    },
  ],
  { basename: import.meta.env.BASE_URL.replace(/\/$/, "") || "/" },
);
