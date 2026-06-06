'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ScoredSite, Weights } from '@/lib/types';
import { scoreToColor } from '@/lib/scoring';

interface Props {
  sites: ScoredSite[];
  onSiteClick: (site: ScoredSite) => void;
  highlightedIds: string[];
  weights: Weights;
}

export default function PriorityList({ sites, onSiteClick, highlightedIds, weights }: Props) {
  const prevRanksRef = useRef<Map<string, number>>(new Map());
  const [pulsing, setPulsing] = useState<Set<string>>(new Set());

  useEffect(() => {
    const prevRanks = prevRanksRef.current;
    const newPulsing = new Set<string>();

    sites.forEach((s, idx) => {
      const prevRank = prevRanks.get(s.site.site_id);
      if (prevRank !== undefined && prevRank - idx >= 3) {
        newPulsing.add(s.site.site_id);
      }
    });

    if (newPulsing.size > 0) {
      setPulsing(newPulsing);
      const timer = setTimeout(() => setPulsing(new Set()), 1200);
      // Build new rank map
      const newMap = new Map<string, number>();
      sites.forEach((s, idx) => newMap.set(s.site.site_id, idx));
      prevRanksRef.current = newMap;
      return () => clearTimeout(timer);
    }

    // Build new rank map
    const newMap = new Map<string, number>();
    sites.forEach((s, idx) => newMap.set(s.site.site_id, idx));
    prevRanksRef.current = newMap;
  }, [sites]);

  return (
    <div style={{ height: '100%', overflow: 'hidden auto' }}>
      <div style={{
        padding: '10px 12px 6px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{
          fontFamily: 'Bricolage Grotesque, sans-serif',
          fontWeight: 700,
          fontSize: '12px',
          color: 'var(--text)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}>
          Priority List
        </span>
        <span style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '10px',
          color: 'var(--text-dim)',
        }}>
          {sites.length} sites
        </span>
      </div>

      <AnimatePresence>
        {sites.map((scored, idx) => {
          const { site, score } = scored;
          const color = scoreToColor(score);
          const isHighlighted = highlightedIds.length > 0 && highlightedIds.includes(site.site_id);
          const isPulsing = pulsing.has(site.site_id);
          const isLowlighted = highlightedIds.length > 0 && !highlightedIds.includes(site.site_id);

          return (
            <motion.div
              key={site.site_id}
              layout="position"
              initial={{ opacity: 0 }}
              animate={{
                opacity: isLowlighted ? 0.4 : 1,
                backgroundColor: isPulsing ? `rgba(255,92,60,0.18)` : 'transparent',
              }}
              exit={{ opacity: 0 }}
              transition={{ layout: { duration: 0.35, ease: 'easeInOut' }, opacity: { duration: 0.2 } }}
              onClick={() => onSiteClick(scored)}
              style={{
                padding: '10px 12px',
                borderBottom: '1px solid rgba(42,51,47,0.5)',
                cursor: 'pointer',
                borderLeft: isHighlighted ? `3px solid ${color}` : '3px solid transparent',
                background: isHighlighted ? `rgba(${parseRgb(color)},0.06)` : undefined,
              }}
              onMouseEnter={e => {
                if (!isPulsing) (e.currentTarget as HTMLDivElement).style.backgroundColor = 'var(--surface-2)';
              }}
              onMouseLeave={e => {
                if (!isPulsing) (e.currentTarget as HTMLDivElement).style.backgroundColor = '';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                {/* Rank */}
                <span style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'var(--text-dim)',
                  minWidth: '22px',
                  paddingTop: '1px',
                }}>
                  {idx + 1}
                </span>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontFamily: 'Hanken Grotesk, sans-serif',
                    fontWeight: 600,
                    fontSize: '12px',
                    color: 'var(--text)',
                    marginBottom: '1px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {site.address}
                  </div>
                  <div style={{
                    fontFamily: 'Hanken Grotesk, sans-serif',
                    fontSize: '11px',
                    color: 'var(--text-dim)',
                    marginBottom: '6px',
                  }}>
                    {site.neighborhood} · {site.borough}
                  </div>

                  {/* Score bar */}
                  <div style={{
                    height: '3px',
                    background: 'var(--border)',
                    borderRadius: '2px',
                    marginBottom: '7px',
                    overflow: 'hidden',
                  }}>
                    <motion.div
                      animate={{ width: `${Math.min(score, 100)}%` }}
                      transition={{ duration: 0.4, ease: 'easeOut' }}
                      style={{
                        height: '100%',
                        background: color,
                        borderRadius: '2px',
                      }}
                    />
                  </div>

                  {/* Chips */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    <span style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '10px',
                      fontWeight: 600,
                      color: color,
                    }}>
                      {score.toFixed(1)}
                    </span>
                    <span className="chip">HVI {site.heat_vulnerability_index}</span>
                    <span className="chip">{site.area_canopy_pct}% canopy</span>
                    <span className="chip">{site.surface_temp_anomaly_f > 0 ? '+' : ''}{site.surface_temp_anomaly_f}°F</span>
                    <span className={`chip ${site.site_status === 'Plantable' ? 'chip-plantable' : 'chip-needs-space'}`}>
                      {site.site_status === 'Plantable' ? 'Plantable' : 'Needs space'}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

function parseRgb(color: string): string {
  const m = color.match(/rgb\((\d+),(\d+),(\d+)\)/);
  if (!m) return '255,255,255';
  return `${m[1]},${m[2]},${m[3]}`;
}
