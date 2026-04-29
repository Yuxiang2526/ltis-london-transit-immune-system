import { createContext, useContext } from "react";
import type { LSOAFeatureCollection, ScenarioSummary } from "./schema";

export interface LTISDataValue {
  lsoaData: LSOAFeatureCollection;
  scenarioSummary: ScenarioSummary;
}

export const LTISDataContext = createContext<LTISDataValue | null>(null);

/** Hook used by every route to read the loaded dataset. Throws if used
 * outside the provider — that should never happen at runtime because the
 * RootLayout gates its <Outlet /> on data being ready. */
export function useLTISDataContext(): LTISDataValue {
  const value = useContext(LTISDataContext);
  if (!value) {
    throw new Error(
      "useLTISDataContext used outside <LTISDataContext.Provider>. " +
        "Ensure the route is mounted under RootLayout.",
    );
  }
  return value;
}
