export interface PlantingSite {
  site_id: string;
  address: string;
  neighborhood: string;
  borough: string;
  community_district: string;
  latitude: number;
  longitude: number;
  surface_temp_anomaly_f: number;
  area_canopy_pct: number;
  heat_vulnerability_index: number;
  near_sensitive_site: string;
  site_status: 'Plantable' | 'Needs space creation';
  recommended_species: string;
  est_survival_5yr_pct: number;
  annual_co2_seq_lbs: number;
  annual_stormwater_gal: number;
  annual_air_quality_value_usd: number;
  annual_energy_savings_usd: number;
  total_annual_benefit_usd: number;
  planting_cost_usd: number;
  neighborhood_current_canopy_pct: number;
  neighborhood_canopy_goal_pct: number;
  last_nearby_planting_year: number;
  planner_notes: string;
  default_priority_score: number;
}

export interface Weights {
  heat: number;    // default 0.25
  gap: number;     // default 0.25
  equity: number;  // default 0.30
  exposure: number; // default 0.20
}

export interface Filters {
  borough: string;
  district: string;
  status: string;
  species: string;
  sensitiveOnly: boolean;
}

export interface ScoredSite {
  site: PlantingSite;
  score: number;
  components: { heat_n: number; gap_n: number; equity_n: number; expose_n: number };
}
