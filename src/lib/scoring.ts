import { PlantingSite, Weights, ScoredSite } from './types';

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function scoreSite(site: PlantingSite, weights: Weights): ScoredSite {
  const heat_n   = clamp((site.surface_temp_anomaly_f + 1) / 13.5, 0, 1);
  const gap_n    = Math.max(0, 30 - site.area_canopy_pct) / 30;
  const equity_n = (site.heat_vulnerability_index - 1) / 4;
  const expose_n = site.near_sensitive_site !== 'None' ? 1.0 : 0.4;

  let score = 100 * (
    weights.heat * heat_n +
    weights.gap * gap_n +
    weights.equity * equity_n +
    weights.exposure * expose_n
  );

  if (site.site_status !== 'Plantable') score -= 12;
  score = Math.max(0, score);

  return {
    site,
    score,
    components: { heat_n, gap_n, equity_n, expose_n },
  };
}

export function scoreToColor(score: number): string {
  const cool = { r: 0x22, g: 0xD3, b: 0xC5 };
  const warm = { r: 0xF2, g: 0xA9, b: 0x3B };
  const hot  = { r: 0xFF, g: 0x5C, b: 0x3C };

  let r: number, g: number, b: number;

  if (score <= 50) {
    const t = score / 50;
    r = Math.round(cool.r + t * (warm.r - cool.r));
    g = Math.round(cool.g + t * (warm.g - cool.g));
    b = Math.round(cool.b + t * (warm.b - cool.b));
  } else {
    const t = (score - 50) / 50;
    r = Math.round(warm.r + t * (hot.r - warm.r));
    g = Math.round(warm.g + t * (hot.g - warm.g));
    b = Math.round(warm.b + t * (hot.b - warm.b));
  }

  return `rgb(${r},${g},${b})`;
}

export function scoreSites(sites: PlantingSite[], weights: Weights): ScoredSite[] {
  return sites
    .map(site => scoreSite(site, weights))
    .sort((a, b) => b.score - a.score);
}
