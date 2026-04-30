import { createBrowserRouter } from "react-router-dom";

import RootLayout from "./RootLayout";
import StoryRoute from "./StoryRoute";
import ExploreRoute from "./ExploreRoute";
import NetworkRoute from "./NetworkRoute";
import MethodologyRoute from "./MethodologyRoute";
import AboutRoute from "./AboutRoute";

/**
 * All routes are bundled into the main JS chunk (no React.lazy).
 *
 * Why: lazy-loaded chunks get content-hashed filenames. When a new deploy
 * lands, browsers that cached the old `index.html` still try to fetch chunks
 * by their old hashes — those files are now gone and the route hard-crashes
 * with "Failed to fetch dynamically imported module". On GitHub Pages (where
 * we don't control HTML cache headers) this happens reliably whenever we
 * push. The +80 KB gzip cost of bundling Methodology / Explorer / About /
 * Network into the main chunk is a small price for never crashing again.
 *
 * `BASE_URL` honours Vite's `base` config (set when deploying to GitHub
 * Pages under a subpath). All in-app navigation uses <Link>/<NavLink>, so
 * this is the only place that needs to know about the deployed prefix.
 */
export const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <RootLayout />,
      children: [
        { index: true, element: <StoryRoute /> },
        { path: "explore", element: <ExploreRoute /> },
        { path: "network", element: <NetworkRoute /> },
        { path: "methodology", element: <MethodologyRoute /> },
        { path: "about", element: <AboutRoute /> },
      ],
    },
  ],
  { basename: import.meta.env.BASE_URL.replace(/\/$/, "") || "/" },
);
