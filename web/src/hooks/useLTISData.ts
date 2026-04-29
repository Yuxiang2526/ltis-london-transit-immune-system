import { useEffect, useState } from "react";
import type {
  LSOAFeatureCollection,
  ScenarioSummary,
} from "../data/schema";

interface LTISDataState {
  lsoaData: LSOAFeatureCollection | null;
  scenarioSummary: ScenarioSummary | null;
  loading: boolean;
  error: string | null;
}

const LSOA_URL = `${import.meta.env.BASE_URL}data/lsoa_ltis.geojson`;
const SUMMARY_URL = `${import.meta.env.BASE_URL}data/scenario_summary.json`;

export function useLTISData(): LTISDataState {
  const [lsoaData, setLsoaData] = useState<LSOAFeatureCollection | null>(null);
  const [scenarioSummary, setScenarioSummary] = useState<ScenarioSummary | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        const [lsoaRes, summaryRes] = await Promise.all([
          fetch(LSOA_URL),
          fetch(SUMMARY_URL),
        ]);

        if (!lsoaRes.ok) throw new Error(`Failed to load ${LSOA_URL}`);
        if (!summaryRes.ok) throw new Error(`Failed to load ${SUMMARY_URL}`);

        const [lsoaJson, summaryJson] = (await Promise.all([
          lsoaRes.json(),
          summaryRes.json(),
        ])) as [LSOAFeatureCollection, ScenarioSummary];

        if (cancelled) return;
        setLsoaData(lsoaJson);
        setScenarioSummary(summaryJson);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Unknown data loading error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();
    return () => {
      cancelled = true;
    };
  }, []);

  return { lsoaData, scenarioSummary, loading, error };
}
