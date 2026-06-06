'use client';

import { useMemo } from 'react';
import type { PlantingSite, Weights } from '@/lib/types';
import { scoreSites } from '@/lib/scoring';

interface Props {
  sites: PlantingSite[];
  weights: Weights;
}

interface NeighborhoodData {
  name: string;
  borough: string;
  currentCanopy: number;
  goalCanopy: number;
  gap: number;
  siteCount: number;
  avgHvi: number;
  lastPlanting: number;
}

export default function NeighborhoodTracker({ sites, weights }: Props) {
  const scored = useMemo(() => scoreSites(sites, weights), [sites, weights]);

  const neighborhoods = useMemo(() => {
    const map = new Map<string, NeighborhoodData>();

    sites.forEach(site => {
      const key = `${site.neighborhood}::${site.borough}`;
      if (!map.has(key)) {
        map.set(key, {
          name: site.neighborhood,
          borough: site.borough,
          currentCanopy: site.neighborhood_current_canopy_pct,
          goalCanopy: site.neighborhood_canopy_goal_pct,
          gap: site.neighborhood_canopy_goal_pct - site.neighborhood_current_canopy_pct,
          siteCount: 0,
          avgHvi: 0,
          lastPlanting: 0,
        });
      }
      const nd = map.get(key)!;
      nd.siteCount++;
      nd.avgHvi += site.heat_vulnerability_index;
      if (site.last_nearby_planting_year > nd.lastPlanting) {
        nd.lastPlanting = site.last_nearby_planting_year;
      }
    });

    map.forEach(nd => {
      nd.avgHvi = Math.round((nd.avgHvi / nd.siteCount) * 10) / 10;
    });

    return Array.from(map.values()).sort((a, b) => b.gap - a.gap);
  }, [sites]);

  const highPrioritySiteIds = useMemo(() => {
    return new Set(scored.slice(0, 10).map(s => s.site.site_id));
  }, [scored]);

  const prioritySitesByNeighborhood = useMemo(() => {
    const m = new Map<string, number>();
    scored.forEach(s => {
      if (highPrioritySiteIds.has(s.site.site_id)) {
        const key = `${s.site.neighborhood}::${s.site.borough}`;
        m.set(key, (m.get(key) || 0) + 1);
      }
    });
    return m;
  }, [scored, highPrioritySiteIds]);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 20px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{
          fontFamily: 'Bricolage Grotesque, sans-serif',
          fontWeight: 800,
          fontSize: '24px',
          color: 'var(--text)',
          marginBottom: '6px',
        }}>
          Neighborhood Canopy Tracker
        </h2>
        <p style={{
          fontSize: '13px',
          color: 'var(--text-dim)',
          fontFamily: 'Hanken Grotesk, sans-serif',
        }}>
          Sorted by distance from 30% canopy goal — largest gap first
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
        gap: '12px',
      }}>
        {neighborhoods.map(nd => {
          const key = `${nd.name}::${nd.borough}`;
          const progressPct = Math.min((nd.currentCanopy / nd.goalCanopy) * 100, 100);
          const isAboveGoal = nd.currentCanopy >= nd.goalCanopy;
          const prioritySites = prioritySitesByNeighborhood.get(key) || 0;

          return (
            <div
              key={key}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                padding: '16px',
                transition: 'border-color 0.2s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--canopy)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'; }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <h3 style={{
                    fontFamily: 'Bricolage Grotesque, sans-serif',
                    fontWeight: 700,
                    fontSize: '16px',
                    color: 'var(--text)',
                    marginBottom: '2px',
                  }}>
                    {nd.name}
                  </h3>
                  <p style={{
                    fontSize: '11px',
                    color: 'var(--text-dim)',
                    fontFamily: 'Hanken Grotesk, sans-serif',
                  }}>
                    {nd.borough}
                  </p>
                </div>
                <div style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: isAboveGoal ? 'var(--canopy)' : 'var(--hot)',
                  background: isAboveGoal ? 'rgba(91,217,128,0.1)' : 'rgba(255,92,60,0.1)',
                  border: `1px solid ${isAboveGoal ? 'rgba(91,217,128,0.25)' : 'rgba(255,92,60,0.25)'}`,
                  padding: '4px 8px',
                  borderRadius: '6px',
                }}>
                  {isAboveGoal ? '+' : ''}{nd.gap > 0 ? '-' : ''}{Math.abs(nd.gap)} pp
                </div>
              </div>

              {/* Progress bar */}
              <div style={{ marginBottom: '12px' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '5px',
                }}>
                  <span style={{
                    fontSize: '11px',
                    color: 'var(--text-dim)',
                    fontFamily: 'Hanken Grotesk, sans-serif',
                  }}>
                    Current: <span style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--text)' }}>{nd.currentCanopy}%</span>
                  </span>
                  <span style={{
                    fontSize: '11px',
                    color: 'var(--text-dim)',
                    fontFamily: 'Hanken Grotesk, sans-serif',
                  }}>
                    Goal: <span style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--text)' }}>{nd.goalCanopy}%</span>
                  </span>
                </div>
                <div style={{
                  height: '8px',
                  background: 'var(--border)',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  position: 'relative',
                }}>
                  <div style={{
                    height: '100%',
                    width: `${progressPct}%`,
                    background: isAboveGoal
                      ? 'linear-gradient(to right, var(--canopy-deep), var(--canopy))'
                      : 'linear-gradient(to right, var(--canopy-deep), var(--canopy))',
                    borderRadius: '4px',
                    transition: 'width 0.5s ease',
                  }} />
                  {/* Goal marker */}
                  <div style={{
                    position: 'absolute',
                    right: 0,
                    top: 0,
                    bottom: 0,
                    width: '2px',
                    background: 'rgba(255,255,255,0.2)',
                  }} />
                </div>
              </div>

              {/* Stats */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px',
              }}>
                <div style={{
                  background: 'var(--surface-2)',
                  borderRadius: '6px',
                  padding: '8px',
                }}>
                  <div style={{
                    fontSize: '10px',
                    color: 'var(--text-dim)',
                    fontFamily: 'Hanken Grotesk, sans-serif',
                    marginBottom: '2px',
                  }}>
                    Priority sites
                  </div>
                  <div style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontWeight: 700,
                    fontSize: '15px',
                    color: 'var(--text)',
                  }}>
                    {nd.siteCount}
                    {prioritySites > 0 && (
                      <span style={{ fontSize: '10px', color: 'var(--warm)', marginLeft: '4px' }}>
                        ({prioritySites} top 10)
                      </span>
                    )}
                  </div>
                </div>

                <div style={{
                  background: 'var(--surface-2)',
                  borderRadius: '6px',
                  padding: '8px',
                }}>
                  <div style={{
                    fontSize: '10px',
                    color: 'var(--text-dim)',
                    fontFamily: 'Hanken Grotesk, sans-serif',
                    marginBottom: '2px',
                  }}>
                    Avg HVI
                  </div>
                  <div style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontWeight: 700,
                    fontSize: '15px',
                    color: nd.avgHvi >= 4 ? 'var(--hot)' : nd.avgHvi >= 3 ? 'var(--warm)' : 'var(--cool)',
                  }}>
                    {nd.avgHvi}
                  </div>
                </div>

                <div style={{
                  background: 'var(--surface-2)',
                  borderRadius: '6px',
                  padding: '8px',
                }}>
                  <div style={{
                    fontSize: '10px',
                    color: 'var(--text-dim)',
                    fontFamily: 'Hanken Grotesk, sans-serif',
                    marginBottom: '2px',
                  }}>
                    Last planting
                  </div>
                  <div style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontWeight: 700,
                    fontSize: '15px',
                    color: 'var(--text)',
                  }}>
                    {nd.lastPlanting}
                  </div>
                </div>

                <div style={{
                  background: 'var(--surface-2)',
                  borderRadius: '6px',
                  padding: '8px',
                }}>
                  <div style={{
                    fontSize: '10px',
                    color: 'var(--text-dim)',
                    fontFamily: 'Hanken Grotesk, sans-serif',
                    marginBottom: '2px',
                  }}>
                    Canopy gap
                  </div>
                  <div style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontWeight: 700,
                    fontSize: '15px',
                    color: isAboveGoal ? 'var(--canopy)' : 'var(--text)',
                  }}>
                    {isAboveGoal ? '✓ Met' : `${nd.gap} pp`}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
