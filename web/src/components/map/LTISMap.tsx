import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";

import type {
  LSOAFeature,
  LSOAFeatureCollection,
  MapMetric,
  ScenarioId,
} from "../../data/schema";
import { buildFillColorExpression, getPaintConfig } from "../../lib/mapExpressions";
import MapLegend from "./MapLegend";

interface LTISMapProps {
  data: LSOAFeatureCollection;
  scenario: ScenarioId;
  metric: MapMetric;
  selectedFeature: LSOAFeature | null;
  onSelectFeature: (feature: LSOAFeature | null) => void;
  onHoverFeature: (feature: LSOAFeature | null) => void;
  /**
   * Optional camera target. When supplied, the map smoothly flyTo's to this
   * lng/lat + zoom on every change. Used by the Story scrollytelling so each
   * act zooms into the borough/corridor the prose is talking about, instead
   * of all four acts staring at the same wide London view.
   */
  view?: { center: [number, number]; zoom: number } | null;
  /**
   * Optional pulsing spotlight overlay. Rendered as an absolutely-positioned
   * ring whose centre is projected from this lng/lat each frame, so it
   * follows the map as the user pans/zooms. Used by the Story to draw the
   * eye to the affected corridor on Acts II–IV.
   */
  spotlight?: { center: [number, number]; radiusPx?: number; label?: string } | null;
  /** Suppresses the bottom-right legend (Story page renders its own). */
  hideLegend?: boolean;
  /** Hides the +/- navigation control (used in story mode). */
  disableInteraction?: boolean;
}

const SOURCE_ID = "lsoa-ltis-source";
const FILL_LAYER_ID = "lsoa-ltis-fill";
const LINE_LAYER_ID = "lsoa-ltis-outline";
const SELECTED_LAYER_ID = "lsoa-ltis-selected";
const TUBE_SOURCE_ID = "ltis-tube-lines";
const TUBE_LAYER_ID = "ltis-tube-lines-fill";
const TUBE_DISRUPTED_LAYER_ID = "ltis-tube-line-disrupted";

const RAIL_LINES_URL = `${import.meta.env.BASE_URL}data/rail_lines.geojson`;

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
  view = null,
  spotlight = null,
  hideLegend = false,
}: LTISMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const handlersRef = useRef({ onSelectFeature, onHoverFeature });
  const [spotlightPx, setSpotlightPx] = useState<{ x: number; y: number } | null>(null);

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

      // LSOA hairlines — zoom-responsive so they fade in as the user zooms in,
      // giving the choropleth more visible structure without making it noisy
      // at low zoom.
      map.addLayer({
        id: LINE_LAYER_ID,
        type: "line",
        source: SOURCE_ID,
        paint: {
          "line-color": "rgba(16, 70, 128, 0.22)",
          "line-width": [
            "interpolate", ["linear"], ["zoom"],
            8,  0.3,
            10, 0.55,
            12, 0.9,
            15, 1.2,
          ],
          "line-opacity": [
            "interpolate", ["linear"], ["zoom"],
            8,  0.4,
            12, 0.85,
          ],
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

      // Rail lines overlay — real geometry from Siyan's route_lines.geojson,
      // filtered to the 15 rail / Tube / DLR / Overground / Tramlink lines
      // (buses are too dense to look good as a background overlay). Each
      // feature carries its own TfL line colour.
      fetch(RAIL_LINES_URL)
        .then((r) => (r.ok ? r.json() : null))
        .then((geo) => {
          if (!geo || !mapRef.current) return;
          if (!map.getSource(TUBE_SOURCE_ID)) {
            map.addSource(TUBE_SOURCE_ID, { type: "geojson", data: geo });
            // Subtle white halo so coloured lines pop on the LSOA fill.
            map.addLayer({
              id: TUBE_LAYER_ID + "-halo",
              type: "line",
              source: TUBE_SOURCE_ID,
              paint: {
                "line-color": "rgba(255, 255, 255, 0.85)",
                "line-width": [
                  "interpolate", ["linear"], ["zoom"],
                  8, 2.0,
                  12, 4.0,
                  15, 7.0,
                ],
              },
            });
            map.addLayer({
              id: TUBE_LAYER_ID,
              type: "line",
              source: TUBE_SOURCE_ID,
              paint: {
                // TfL official colour per line, from the data
                "line-color": ["coalesce", ["get", "color"], "#104680"],
                "line-width": [
                  "interpolate", ["linear"], ["zoom"],
                  8, 1.0,
                  12, 2.4,
                  15, 4.0,
                ],
                "line-opacity": 0.92,
              },
            });
            map.addLayer({
              id: TUBE_DISRUPTED_LAYER_ID,
              type: "line",
              source: TUBE_SOURCE_ID,
              filter: ["==", ["get", "route"], "__none__"],
              paint: {
                "line-color": "#b72230",
                "line-width": 3.5,
                "line-dasharray": [1.6, 1.4],
              },
            });
          }
        })
        .catch(() => {
          // Non-fatal: map still works without the rail overlay.
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
  // 3b. Disrupted route highlight. Our scenarios are bus routes (99, R2, 685)
  // which aren't in the rail-only overlay, so the dashed-red highlight stays
  // empty for these — the choropleth conveys the disruption visually instead.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.getLayer(TUBE_DISRUPTED_LAYER_ID)) return;
    map.setFilter(TUBE_DISRUPTED_LAYER_ID, ["==", ["get", "route"], scenario]);
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

  // -------------------------------------------------------------------------
  // 5. Camera flyTo — used by the Story scrollytelling to zoom into each
  //    act's affected borough. Skipped if no view supplied (Explorer/Network
  //    pages keep the user's current pan/zoom).
  // -------------------------------------------------------------------------
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !view) return;

    // If the style hasn't loaded yet, defer the camera animation until it
    // does — flyTo before style-load fires `move` events but doesn't always
    // commit the transform reliably across browsers.
    const run = () =>
      map.flyTo({
        center: view.center,
        zoom: view.zoom,
        speed: 0.8,
        curve: 1.5,
        essential: true,
      });
    if (map.isStyleLoaded()) run();
    else map.once("load", run);
  }, [view?.center?.[0], view?.center?.[1], view?.zoom]); // eslint-disable-line react-hooks/exhaustive-deps

  // -------------------------------------------------------------------------
  // 6. Spotlight projection — every map move recomputes the screen-space
  //    pixel position of the spotlight lng/lat so the absolutely-positioned
  //    ring stays anchored to the geography while the user pans.
  // -------------------------------------------------------------------------
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !spotlight) {
      // Clearing on next tick avoids the "calling setState synchronously
      // inside an effect" cascade-render lint rule.
      const handle = window.requestAnimationFrame(() => setSpotlightPx(null));
      return () => window.cancelAnimationFrame(handle);
    }
    const project = () => {
      const { x, y } = map.project(spotlight.center);
      setSpotlightPx({ x, y });
    };
    project();
    map.on("move", project);
    map.on("resize", project);
    return () => {
      map.off("move", project);
      map.off("resize", project);
    };
  }, [spotlight?.center?.[0], spotlight?.center?.[1]]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="map-wrapper" style={{ minHeight: 500 }}>
      <div
        ref={containerRef}
        className="map-container"
        // Inline width/height/minHeight as a hard guarantee — overrides any
        // CSS chain failure and prevents MapLibre from creating a 0×0 canvas.
        style={{ width: "100%", height: "100%", minHeight: 500 }}
      />
      {spotlight && spotlightPx ? (
        <div
          className="map-spotlight"
          style={{
            left: spotlightPx.x,
            top: spotlightPx.y,
            // The CSS uses --r as the spotlight ring radius in px.
            ["--r" as never]: `${spotlight.radiusPx ?? 80}px`,
          }}
          aria-hidden="true"
        >
          <span className="map-spotlight__ring map-spotlight__ring--outer" />
          <span className="map-spotlight__ring map-spotlight__ring--inner" />
          {spotlight.label ? (
            <span className="map-spotlight__label">{spotlight.label}</span>
          ) : null}
        </div>
      ) : null}
      {hideLegend ? null : <MapLegend scenario={scenario} metric={metric} />}
    </div>
  );
}
