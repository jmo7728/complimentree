'use client';

import { useState, useEffect, useRef } from 'react';
import type { PlantingSite } from '@/lib/types';

interface Props {
  sites: PlantingSite[];
}

function useCountUp(target: number, duration = 1200, decimals = 0) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(parseFloat((eased * target).toFixed(decimals)));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setValue(target);
      }
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, duration, decimals]);

  return value;
}

function MetricCard({
  label,
  value,
  unit,
  icon,
}: {
  label: string;
  value: number;
  unit: string;
  icon: string;
}) {
  const displayValue = useCountUp(value, 1400, unit === 'K' || unit === 'lbs' ? 0 : 0);

  const formatted = () => {
    if (unit === 'K') return `$${Math.round(displayValue / 1000).toLocaleString()}K`;
    if (unit === 'lbs') return `${Math.round(displayValue).toLocaleString()} lbs`;
    return Math.round(displayValue).toLocaleString();
  };

  return (
    <div style={{
      flex: 1,
      background: 'var(--surface-2)',
      border: '1px solid var(--border)',
      borderRadius: '8px',
      padding: '10px 14px',
      display: 'flex',
      flexDirection: 'column',
      gap: '2px',
    }}>
      <div style={{
        fontSize: '11px',
        color: 'var(--text-dim)',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        fontFamily: 'Hanken Grotesk, sans-serif',
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
      }}>
        <span>{icon}</span>
        <span>{label}</span>
      </div>
      <div style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontWeight: 600,
        fontSize: '18px',
        color: 'var(--text)',
        letterSpacing: '-0.02em',
      }}>
        {formatted()}
      </div>
    </div>
  );
}

export default function MetricsStrip({ sites }: Props) {
  const totalSites = sites.length;
  const plantableNow = sites.filter(s => s.site_status === 'Plantable').length;
  const totalBenefit = sites.reduce((sum, s) => sum + s.total_annual_benefit_usd, 0);
  const totalCo2 = sites.reduce((sum, s) => sum + s.annual_co2_seq_lbs, 0);
  const belowGoal = new Set(
    sites
      .filter(s => s.neighborhood_current_canopy_pct < s.neighborhood_canopy_goal_pct)
      .map(s => s.neighborhood)
  ).size;

  return (
    <div style={{
      borderBottom: '1px solid var(--border)',
      background: 'var(--surface)',
      padding: '8px 16px',
      display: 'flex',
      gap: '8px',
      flexShrink: 0,
    }}>
      <MetricCard label="Sites Tracked" value={totalSites} unit="" icon="📍" />
      <MetricCard label="Plantable Now" value={plantableNow} unit="" icon="🌱" />
      <MetricCard label="Annual Benefit" value={totalBenefit} unit="K" icon="💰" />
      <MetricCard label="CO₂ Captured" value={totalCo2} unit="lbs" icon="🍃" />
      <MetricCard label="Below 30% Goal" value={belowGoal} unit="" icon="🎯" />
    </div>
  );
}
