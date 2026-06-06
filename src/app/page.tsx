'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { PLANTING_SITES } from '@/lib/data';
import { scoreSites } from '@/lib/scoring';
import type { Weights, Filters, ScoredSite, PlantingSite } from '@/lib/types';
import dynamic from 'next/dynamic';
import MetricsStrip from '@/components/MetricsStrip';
import WeightSliders from '@/components/WeightSliders';
import FiltersPanel from '@/components/FiltersPanel';
import PriorityList from '@/components/PriorityList';
import QueryBar from '@/components/QueryBar';
import SiteDetail from '@/components/SiteDetail';
import NeighborhoodTracker from '@/components/NeighborhoodTracker';

const MapView = dynamic(() => import('@/components/MapView'), { ssr: false });

const DEFAULT_WEIGHTS: Weights = { heat: 0.25, gap: 0.25, equity: 0.30, exposure: 0.20 };
const DEFAULT_FILTERS: Filters = { borough: '', district: '', status: '', species: '', sensitiveOnly: false };

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [view, setView] = useState<'dashboard' | 'tracker'>('dashboard');
  const [weights, setWeights] = useState<Weights>(DEFAULT_WEIGHTS);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [selectedSite, setSelectedSite] = useState<ScoredSite | null>(null);
  const [highlightedIds, setHighlightedIds] = useState<string[]>([]);
  const [queryRationale, setQueryRationale] = useState<string>('');
  const [appliedFiltersDesc, setAppliedFiltersDesc] = useState<string>('');

  useEffect(() => {
    setMounted(true);
    const u = localStorage.getItem('canopyiq_user');
    if (!u) {
      router.replace('/login');
    } else {
      setUser(u);
    }
  }, [router]);

  const scoredSites = useMemo(() => scoreSites(PLANTING_SITES, weights), [weights]);

  const filteredSites = useMemo(() => {
    return scoredSites.filter(({ site }) => {
      if (filters.borough && site.borough !== filters.borough) return false;
      if (filters.district && site.community_district !== filters.district) return false;
      if (filters.status && site.site_status !== filters.status) return false;
      if (filters.species && site.recommended_species !== filters.species) return false;
      if (filters.sensitiveOnly && site.near_sensitive_site === 'None') return false;
      return true;
    });
  }, [scoredSites, filters]);

  const handleLogout = () => {
    localStorage.removeItem('canopyiq_user');
    router.replace('/login');
  };

  const handleQueryResult = (result: {
    rationale: string;
    adjustedWeights?: Weights | null;
    highlightedSiteIds?: string[];
    appliedFiltersDescription: string;
  }) => {
    if (result.adjustedWeights) setWeights(result.adjustedWeights);
    if (result.highlightedSiteIds) setHighlightedIds(result.highlightedSiteIds);
    setQueryRationale(result.rationale);
    setAppliedFiltersDesc(result.appliedFiltersDescription);
  };

  const handleClearQuery = () => {
    setHighlightedIds([]);
    setQueryRationale('');
    setAppliedFiltersDesc('');
  };

  if (!mounted || !user) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          fontFamily: 'JetBrains Mono, monospace',
          color: 'var(--text-dim)',
          fontSize: '13px',
        }}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <header style={{
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        padding: '0 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '52px',
        flexShrink: 0,
        zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '6px',
            background: 'linear-gradient(135deg, var(--canopy-deep), var(--canopy))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
          }}>
            🌳
          </div>
          <h1 style={{
            fontFamily: 'Bricolage Grotesque, sans-serif',
            fontWeight: 800,
            fontSize: '20px',
            letterSpacing: '-0.02em',
            color: 'var(--text)',
          }}>
            CANOPY<span style={{ color: 'var(--canopy)' }}>IQ</span>
          </h1>
          <span style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '9px',
            fontWeight: 600,
            background: 'rgba(255, 92, 60, 0.15)',
            border: '1px solid rgba(255, 92, 60, 0.3)',
            color: 'var(--hot)',
            padding: '2px 6px',
            borderRadius: '4px',
            letterSpacing: '0.08em',
          }}>
            DEMO
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setView('dashboard')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 600,
              background: view === 'dashboard' ? 'var(--surface-2)' : 'transparent',
              color: view === 'dashboard' ? 'var(--canopy)' : 'var(--text-dim)',
              border: view === 'dashboard' ? '1px solid var(--border)' : '1px solid transparent',
              transition: 'all 0.2s',
            }}
          >
            Dashboard
          </button>
          <button
            onClick={() => setView('tracker')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 600,
              background: view === 'tracker' ? 'var(--surface-2)' : 'transparent',
              color: view === 'tracker' ? 'var(--canopy)' : 'var(--text-dim)',
              border: view === 'tracker' ? '1px solid var(--border)' : '1px solid transparent',
              transition: 'all 0.2s',
            }}
          >
            Neighborhood Tracker
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '11px',
            color: 'var(--text-dim)',
          }}>
            {user}
          </span>
          <button
            onClick={handleLogout}
            style={{
              padding: '5px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              background: 'transparent',
              color: 'var(--text-dim)',
              border: '1px solid var(--border)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              (e.target as HTMLButtonElement).style.color = 'var(--hot)';
              (e.target as HTMLButtonElement).style.borderColor = 'rgba(255,92,60,0.4)';
            }}
            onMouseLeave={e => {
              (e.target as HTMLButtonElement).style.color = 'var(--text-dim)';
              (e.target as HTMLButtonElement).style.borderColor = 'var(--border)';
            }}
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Metrics Strip */}
      <MetricsStrip sites={PLANTING_SITES} />

      {/* Main content */}
      {view === 'dashboard' ? (
        <div style={{
          flex: 1,
          display: 'flex',
          overflow: 'hidden',
          minHeight: 0,
        }}>
          {/* Left panel */}
          <div style={{
            width: '280px',
            flexShrink: 0,
            borderRight: '1px solid var(--border)',
            background: 'var(--surface)',
            overflow: 'hidden auto',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <WeightSliders weights={weights} onChange={setWeights} />
            <div style={{ borderTop: '1px solid var(--border)' }}>
              <FiltersPanel
                sites={PLANTING_SITES}
                filters={filters}
                onChange={setFilters}
              />
            </div>
          </div>

          {/* Center: Map */}
          <div style={{ flex: 1, position: 'relative', minWidth: 0 }}>
            <MapView
              sites={filteredSites}
              onSiteClick={setSelectedSite}
              highlightedIds={highlightedIds}
            />
          </div>

          {/* Right panel */}
          <div style={{
            width: '360px',
            flexShrink: 0,
            borderLeft: '1px solid var(--border)',
            background: 'var(--surface)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}>
            <QueryBar
              weights={weights}
              sites={PLANTING_SITES}
              onResult={handleQueryResult}
              onClear={handleClearQuery}
              rationale={queryRationale}
              appliedFiltersDesc={appliedFiltersDesc}
            />
            <div style={{ flex: 1, overflow: 'hidden', borderTop: '1px solid var(--border)' }}>
              <PriorityList
                sites={filteredSites}
                onSiteClick={setSelectedSite}
                highlightedIds={highlightedIds}
                weights={weights}
              />
            </div>
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, overflow: 'hidden auto' }}>
          <NeighborhoodTracker sites={PLANTING_SITES} weights={weights} />
        </div>
      )}

      {/* Site Detail Modal */}
      {selectedSite && (
        <SiteDetail
          scored={selectedSite}
          weights={weights}
          onClose={() => setSelectedSite(null)}
        />
      )}
    </div>
  );
}
