/**
 * Route rankings — shape of `web/public/data/route_rankings.json` produced
 * by `analysis/build_route_rankings.py`. Loaded once when the Explorer
 * mounts; small enough (~3.5 KB) that we don't bother caching.
 */

export interface RouteRankRecord {
  route: string;
  mode: string;
  affectedLsoa: number;
  lost12minAccessLsoa: number;
  worsenedClassLsoa: number;
  meanDelayMin: number;
  retentionRatio: number;
}

export interface RouteRankings {
  generatedFromRegularRoutes: number;
  totalRoutesIncludingSpecial: number;
  normaliseBasis: {
    affectedLsoa: number;
    lost12minAccessLsoa: number;
    worsenedClassLsoa: number;
    meanDelayMin: number;
  };
  top5: RouteRankRecord[];
  top10: RouteRankRecord[];
}

export const ROUTE_RANKINGS_URL =
  `${import.meta.env.BASE_URL}data/route_rankings.json`;
