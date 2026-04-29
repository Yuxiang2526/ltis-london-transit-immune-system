import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";

// Load order matters: tokens → typography → layout → third-party.
import "./styles/tokens.css";
import "./styles/typography.css";
import "./styles/global.css";
import "./styles/editorial.css";
import "maplibre-gl/dist/maplibre-gl.css";
import "katex/dist/katex.min.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
