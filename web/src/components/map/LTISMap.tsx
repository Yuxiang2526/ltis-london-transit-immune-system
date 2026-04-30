import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";

import type {
  LSOAFeature,
  LSOAFeatureCollection,
  MapMetric,
  ScenarioId,
} from "../../data/schema";
import { buildFillColorExpression, getPaintConfig } from "../../lib/mapExpressions";
import { SCENARIO_REGISTRY } from "../../data/scenarios";
import MapLegend from "./MapLegend";

interface LTISMapProps {
  data: LSOAFeatureCollection;
  scenario: ScenarioId;
  metric: MapMetric;
  selectedFeature: LSOAFeature | null;
  onSelectFeature: (feature: LSOAFeature | null) => void;
  onHoverFeature: (feature: LSOAFeature | null) => void;
}

const SOURCE_ID = "lsoa-ltis-source";
const FILL_LAYER_ID = "lsoa-ltis-fill";
const LINE_LAYER_ID = "lsoa-ltis-outline";
const SELECTED_LAYER_ID = "lsoa-ltis-selected";
const TUBE_SOURCE_ID = "ltis-tube-lines";
const TUBE_LAYER_ID = "ltis-tube-lines-fill";
const TUBE_DISRUPTED_LAYER_ID = "ltis-tube-line-disrupted";

const TUBE_LINES_URL = `${import.meta.env.BASE_URL}data/tube_lines.geojson`;

const INITIAL_VIEW = { center: [-0.1, 51.515] as [number, number], zoom: 9.2 };

// OpenFreeMap Positron — free Cloudflare-hosted vector basemap, no API key,
// no rate-limit, MIT licensed. Mimics the CARTO Positron look (light grey
// roads, subtle place labels) which is what the LTIS palette was tuned for.
// Confirmed pipeline works with the MapLibre demo style; swap-in is a
// drop-in replacement.
const BASEMAP_STYLE_URL = "https://tiles.openfreemap.org/styles/positron";

export default function LTISMap({
  data,
  scenario,
  metric,
  selectedFeature,
  onSelectFeature,
  onHoverFeature,
}: LTISMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const handlersRef = useRef({ onSelectFeature, onHoverFeature });

  // Keep latest handlers in a ref so the init effect can stay zero-dep.
  // Without this, recreating the map on every parent re-render becomes the
  // path of least resistance — and that is exactly what we want to avoid.
  useEffect(() => {
    handlersRef.current = { onSelectFeature, onHoverFeature };
  }, [onSelectFeature, onHoverFeature]);

  // -------------------------------------------------------------------------
  // 1. Init — runs ONCE. Sets up the map, source, layers, and listeners.
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const container = containerRef.current;

    // Diagnostic — flat keys so console doesn't collapse them into {...}.
    // The container/canvas sizes here are the single most useful signal for
    // debugging "map initialised but renders nothing" cases.
    console.info(
      "[LTIS] map init  containerW=%d  containerH=%d  features=%d  scenario=%s  metric=%s  base=%s",
      container.clientWidth,
      container.clientHeight,
      data?.features?.length ?? -1,
      scenario,
      metric,
      import.meta.env.BASE_URL,
    );

    const map = new maplibregl.Map({
      container,
      style: BASEMAP_STYLE_URL,
      center: INITIAL_VIEW.center,
      zoom: INITIAL_VIEW.zoom,
    });

    map.on("error", (e) => {
      // Surfaces tile / style fetch failures that otherwise stay silent.
      console.warn("[LTIS] maplibre error", e?.error?.message ?? e);
    });

    map.addControl(
      new maplibregl.NavigationControl({ visualizePitch: true }),
      "top-right",
    );

    const resizeMap = () => map.resize();
    const resizeFrame = window.requestAnimationFrame(resizeMap);
    const resizeObserver = new ResizeObserver(resizeMap);
    resizeObserver.observe(container);

    const setupLayers = () => {
      if (map.getSource(SOURCE_ID)) return;

      map.resize();
      const canvas = map.getCanvas();
      console.info(
        "[LTIS] setupLayers  containerW=%d  containerH=%d  canvasW=%d  canvasH=%d  styleLoaded=%s  features=%d",
        container.clientWidth,
        container.clientHeight,
        canvas.width,
        canvas.height,
        map.isStyleLoaded(),
        data?.features?.length ?? -1,
      );
      map.addSource(SOURCE_ID, { type: "geojson", data: data as never });

      map.addLayer({
        id: FILL_LAYER_ID,
        type: "fill",
        source: SOURCE_ID,
        paint: {
          "fill-color": buildFillColorExpression(getPaintConfig(scenario, metric)) as never,
          "fill-opacity": 0.78,
        },
      });

      map.addLayer({
        id: LINE_LAYER_ID,
        type: "line",
        source: SOURCE_ID,
        paint: {
          "line-color": "rgba(16, 70, 128, 0.18)",
          "line-width": 0.7,
        },
      });

      map.addLayer({
        id: SELECTED_LAYER_ID,
        type: "line",
        source: SOURCE_ID,
        filter: ["==", ["get", "lsoa_code"], ""],
        paint: { "line-color": "#104680", "line-width": 3 },
      });

      map.on("mousemove", FILL_LAYER_ID, (event) => {
        map.getCanvas().style.cursor = "pointer";
        const feature = event.features?.[0] as unknown as LSOAFeature | undefined;
        if (feature) handlersRef.current.onHoverFeature(feature);
      });

      map.on("mouseleave", FILL_LAYER_ID, () => {
        map.getCanvas().style.cursor = "";
        handlersRef.current.onHoverFeature(null);
      });

      map.on("click", FILL_LAYER_ID, (event) => {
        const feature = event.features?.[0] as unknown as LSOAFeature | undefined;
        if (feature) handlersRef.current.onSelectFeature(feature);
      });

      // Tube lines overlay (rough centroid-chained geometry).
      fetch(TUBE_LINES_URL)
        .then((r) => (r.ok ? r.json() : null))
        .then((geo) => {
          if (!geo || !mapRef.current) return;
          if (!map.getSource(TUBE_SOURCE_ID)) {
            map.addSource(TUBE_SOURCE_ID, { type: "geojson", data: geo });
            map.addLayer({
              id: TUBE_LAYER_ID,
              type: "line",
              source: TUBE_SOURCE_ID,
              paint: {
                "line-color": "rgba(16, 70, 128, 0.55)",
                "line-width": 1.4,
              },
            });
            map.addLayer({
              id: TUBE_DISRUPTED_LAYER_ID,
              type: "line",
              source: TUBE_SOURCE_ID,
              filter: ["==", ["get", "line"], "__none__"],
              paint: {
                "line-color": "#b72230",
                "line-width": 3,
                "line-dasharray": [1.6, 1.4],
              },
            });
          }
        })
        .catch(() => {
          // Non-fatal: map still works without tube line overlay.
        });
    };

    if (map.isStyleLoaded()) {
      setupLayers();
    } else {
      map.once("load", setupLayers);
    }

    // Safety net — call resize() every 200 ms for 3 s. Defends against the
    // common "container is 0×0 at init then settles to real size after CSS
    // layout completes" race that produces a silent blank-map.
    const resizeTicks: number[] = [];
    for (let i = 1; i <= 15; i++) {
      resizeTicks.push(
        window.setTimeout(() => {
          if (!mapRef.current) return;
          mapRef.current.resize();
        }, i * 200),
      );
    }

    // Status snapshot at +1 s — captures the post-layout truth in console.
    const statusTimer = window.setTimeout(() => {
      if (!mapRef.current) return;
      const m = mapRef.current;
      const c = m.getCanvas();
      console.info(
        "[LTIS] +1s  containerW=%d  containerH=%d  canvasW=%d  canvasH=%d  loaded=%s  styleLoaded=%s",
        container.clientWidth,
        container.clientHeight,
        c.width,
        c.height,
        m.loaded(),
        m.isStyleLoaded(),
      );
    }, 1000);

    mapRef.current = map;

    return () => {
      window.cancelAnimationFrame(resizeFrame);
      resizeTicks.forEach((id) => window.clearTimeout(id));
      window.clearTimeout(statusTimer);
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: init once.
  }, []);

  // -------------------------------------------------------------------------
  // 2. Data refresh — re-set the source data whenever the GeoJSON changes.
  //    Future-proofs against scenario sets that swap the entire feature set.
  // -------------------------------------------------------------------------
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const source = map.getSource(SOURCE_ID) as maplibregl.GeoJSONSource | undefined;
    if (source) source.setData(data as never);
  }, [data]);

  // -------------------------------------------------------------------------
  // 3. Paint refresh — only the fill expression changes when scenario/metric
  //    change. Cheaper than a full source replace.
  // -------------------------------------------------------------------------
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.getLayer(FILL_LAYER_ID)) return;
    map.setPaintProperty(
      FILL_LAYER_ID,
      "fill-color",
      buildFillColorExpression(getPaintConfig(scenario, metric)) as never,
    );
  }, [scenario, metric]);

  // -------------------------------------------------------------------------
  // 3b. Disrupted tube line filter — highlight the line for current scenario.
  // -------------------------------------------------------------------------
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.getLayer(TUBE_DISRUPTED_LAYER_ID)) return;
    const def = SCENARIO_REGISTRY[scenario];
    const lineName = def?.shortLabel ?? "__none__";
    map.setFilter(TUBE_DISRUPTED_LAYER_ID, ["==", ["get", "line"], lineName]);
  }, [scenario]);

  // -------------------------------------------------------------------------
  // 4. Selection highlight — drive an outline filter from selectedFeature.
  // -------------------------------------------------------------------------
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.getLayer(SELECTED_LAYER_ID)) return;
    const selectedCode = selectedFeature?.properties.lsoa_code ?? "";
    map.setFilter(SELECTED_LAYER_ID, ["==", ["get", "lsoa_code"], selectedCode]);
  }, [selectedFeature]);

  return (
    <div className="map-wrapper" style={{ minHeight: 500 }}>
      <div
        ref={containerRef}
        className="map-container"
        // Inline width/height/minHeight as a hard guarantee — overrides any
        // CSS chain failure and prevents MapLibre from creating a 0×0 canvas.
        style={{ width: "100%", height: "100%", minHeight: 500 }}
      />
      <MapLegend scenario={scenario} metric={metric} />
    </div>
  );
}
