import { useEffect } from "react";
import type maplibregl from "maplibre-gl";
import type { ScenarioId } from "../../data/schema";
import { getScenarioDefinition } from "../../data/scenarios";

interface TubeLineLayerProps {
  /** Map instance to attach to. Owned by the parent LTISMap. */
  map: maplibregl.Map | null;
  /** GeoJSON LineString collection — one feature per line. */
  geometry: GeoJSON.FeatureCollection<GeoJSON.LineString> | null;
  /** Currently disrupted scenario; that line is rendered dashed/red. */
  disruptedScenario: ScenarioId | null;
}

const LINES_SOURCE_ID = "ltis-tube-lines";
const LINES_LAYER_ID = "ltis-tube-lines-fill";
const DISRUPTED_LAYER_ID = "ltis-tube-line-disrupted";

/**
 * Renders Tube line geometry as a MapLibre line layer overlaid on the
 * choropleth. The disrupted line for the active scenario is rendered with a
 * dashed red stroke; remaining lines render at low opacity in their official
 * TfL colours (read from `geometry.features[i].properties.lineColor`).
 *
 * Skeleton state: source + layers are added when `geometry` first arrives
 * and cleaned up on unmount. The pipeline at `analysis/03_simulate_scenarios.ipynb`
 * will produce the GeoJSON this consumes.
 */
export default function TubeLineLayer({
  map,
  geometry,
  disruptedScenario,
}: TubeLineLayerProps) {
  // Add / replace source as geometry arrives.
  useEffect(() => {
    if (!map || !geometry) return;
    if (!map.isStyleLoaded()) {
      const onLoad = () => attach(map, geometry);
      map.once("load", onLoad);
      return () => {
        map.off("load", onLoad);
      };
    }
    attach(map, geometry);
    return () => detach(map);
  }, [map, geometry]);

  // Filter the disrupted-line layer to the currently-disrupted scenario.
  useEffect(() => {
    if (!map || !map.getLayer(DISRUPTED_LAYER_ID)) return;
    const lineId = disruptedScenario
      ? getScenarioDefinition(disruptedScenario).id
      : "__none__";
    map.setFilter(DISRUPTED_LAYER_ID, ["==", ["get", "lineId"], lineId]);
  }, [map, disruptedScenario]);

  return null;
}

function attach(
  map: maplibregl.Map,
  geometry: GeoJSON.FeatureCollection<GeoJSON.LineString>,
): void {
  if (map.getSource(LINES_SOURCE_ID)) {
    (map.getSource(LINES_SOURCE_ID) as maplibregl.GeoJSONSource).setData(
      geometry as never,
    );
    return;
  }

  map.addSource(LINES_SOURCE_ID, { type: "geojson", data: geometry as never });

  map.addLayer({
    id: LINES_LAYER_ID,
    type: "line",
    source: LINES_SOURCE_ID,
    paint: {
      "line-color": ["coalesce", ["get", "lineColor"], "#ffffff"],
      "line-width": 2,
      "line-opacity": 0.55,
    },
  });

  map.addLayer({
    id: DISRUPTED_LAYER_ID,
    type: "line",
    source: LINES_SOURCE_ID,
    filter: ["==", ["get", "lineId"], "__none__"],
    paint: {
      "line-color": "#ff4d4d",
      "line-width": 4,
      "line-dasharray": [1.5, 1.5],
    },
  });
}

function detach(map: maplibregl.Map): void {
  for (const id of [DISRUPTED_LAYER_ID, LINES_LAYER_ID]) {
    if (map.getLayer(id)) map.removeLayer(id);
  }
  if (map.getSource(LINES_SOURCE_ID)) map.removeSource(LINES_SOURCE_ID);
}
