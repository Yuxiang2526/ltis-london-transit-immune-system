import { createBrowserRouter } from "react-router-dom";

import RootLayout from "./RootLayout";
import StoryRoute from "./StoryRoute";
import ExploreRoute from "./ExploreRoute";
import MethodologyRoute from "./MethodologyRoute";
import AboutRoute from "./AboutRoute";

/**
 * `BASE_URL` honours Vite's `base` config (set when deploying to GitHub Pages
 * under a subpath). All in-app navigation uses <Link>/<NavLink>, so this is
 * the only place that needs to know about the deployed prefix.
 */
export const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <RootLayout />,
      children: [
        { index: true, element: <StoryRoute /> },
        { path: "explore", element: <ExploreRoute /> },
        { path: "methodology", element: <MethodologyRoute /> },
        { path: "about", element: <AboutRoute /> },
      ],
    },
  ],
  { basename: import.meta.env.BASE_URL.replace(/\/$/, "") || "/" },
);
