import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import type { LSOAFeature } from "../../data/schema";

interface AnnotationLayerProps {
  /** Map instance to attach to. */
  map: maplibregl.Map | null;
  /** Features to annotate (typically top-N by current metric). */
  features: LSOAFeature[];
  /** A short string per feature, eg "Northolt: 73% → 41%". */
  buildLabel: (feature: LSOAFeature) => string;
}

/**
 * Auto-generated MapLibre popups that pin call-out labels onto the top-N
 * LSOAs for the current view. Used by the scrollytelling Act III ("immune
 * response") to spotlight the most-affected neighbourhoods, and by the
 * exploratory ranking chart hover to mirror selection on the map.
 */
export default function AnnotationLayer({
  map,
  features,
  buildLabel,
}: AnnotationLayerProps) {
  const popupsRef = useRef<maplibregl.Popup[]>([]);

  useEffect(() => {
    if (!map) return;

    // Tear down any previous round.
    for (const popup of popupsRef.current) popup.remove();
    popupsRef.current = [];

    for (const feature of features) {
      const center = featureCentroid(feature);
      if (!center) continue;
      const popup = new maplibregl.Popup({
        closeButton: false,
        closeOnClick: false,
        anchor: "left",
        offset: 12,
        className: "ltis-annotation-popup",
      })
        .setLngLat(center)
        .setText(buildLabel(feature))
        .addTo(map);
      popupsRef.current.push(popup);
    }

    return () => {
      for (const popup of popupsRef.current) popup.remove();
      popupsRef.current = [];
    };
  }, [map, features, buildLabel]);

  return null;
}

/** Crude polygon centroid — good enough for a label anchor. */
function featureCentroid(feature: LSOAFeature): [number, number] | null {
  const geom = feature.geometry;
  if (!geom) return null;
  const coords =
    geom.type === "Polygon"
      ? geom.coordinates[0]
      : geom.type === "MultiPolygon"
        ? geom.coordinates[0]?.[0]
        : null;
  if (!coords || coords.length === 0) return null;
  let sumX = 0;
  let sumY = 0;
  for (const [x, y] of coords) {
    sumX += x;
    sumY += y;
  }
  return [sumX / coords.length, sumY / coords.length];
}
