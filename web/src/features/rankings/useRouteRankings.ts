import { useEffect, useState } from "react";
import { ROUTE_RANKINGS_URL, type RouteRankings } from "./routeRankings";

interface State {
  data: RouteRankings | null;
  error: string | null;
}

export function useRouteRankings(): State {
  const [data, setData] = useState<RouteRankings | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(ROUTE_RANKINGS_URL)
      .then((r) => {
        if (!r.ok) throw new Error(`Failed to load ${ROUTE_RANKINGS_URL}: ${r.status}`);
        return r.json() as Promise<RouteRankings>;
      })
      .then((json) => {
        if (cancelled) return;
        setData(json);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : String(e));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { data, error };
}
