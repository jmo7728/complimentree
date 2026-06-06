'use client';

import type { PlantingSite, Filters } from '@/lib/types';

interface Props {
  sites: PlantingSite[];
  filters: Filters;
  onChange: (f: Filters) => void;
}

export default function FiltersPanel({ sites, filters, onChange }: Props) {
  const boroughs = Array.from(new Set(sites.map(s => s.borough))).sort();
  const districts = Array.from(new Set(sites.map(s => s.community_district))).sort();
  const statuses = Array.from(new Set(sites.map(s => s.site_status))).sort();
  const species = Array.from(new Set(sites.map(s => s.recommended_species))).sort();

  const set = (k: keyof Filters, v: string | boolean) => onChange({ ...filters, [k]: v });

  const hasActive = filters.borough || filters.district || filters.status || filters.species || filters.sensitiveOnly;

  return (
    <div style={{ padding: '16px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '14px',
      }}>
        <h3 style={{
          fontFamily: 'Bricolage Grotesque, sans-serif',
          fontWeight: 700,
          fontSize: '13px',
          color: 'var(--text)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}>
          Filters
        </h3>
        {hasActive && (
          <button
            onClick={() => onChange({ borough: '', district: '', status: '', species: '', sensitiveOnly: false })}
            style={{
              fontSize: '10px',
              color: 'var(--hot)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'Hanken Grotesk, sans-serif',
            }}
          >
            Clear all
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div>
          <label style={{
            fontSize: '10px',
            fontWeight: 600,
            color: 'var(--text-dim)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            display: 'block',
            marginBottom: '4px',
          }}>
            Borough
          </label>
          <select value={filters.borough} onChange={e => set('borough', e.target.value)}>
            <option value="">All boroughs</option>
            {boroughs.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>

        <div>
          <label style={{
            fontSize: '10px',
            fontWeight: 600,
            color: 'var(--text-dim)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            display: 'block',
            marginBottom: '4px',
          }}>
            District
          </label>
          <select value={filters.district} onChange={e => set('district', e.target.value)}>
            <option value="">All districts</option>
            {districts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <div>
          <label style={{
            fontSize: '10px',
            fontWeight: 600,
            color: 'var(--text-dim)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            display: 'block',
            marginBottom: '4px',
          }}>
            Site Status
          </label>
          <select value={filters.status} onChange={e => set('status', e.target.value)}>
            <option value="">All statuses</option>
            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div>
          <label style={{
            fontSize: '10px',
            fontWeight: 600,
            color: 'var(--text-dim)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            display: 'block',
            marginBottom: '4px',
          }}>
            Species
          </label>
          <select value={filters.species} onChange={e => set('species', e.target.value)}>
            <option value="">All species</option>
            {species.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
          padding: '8px 0',
        }}>
          <input
            type="checkbox"
            checked={filters.sensitiveOnly}
            onChange={e => set('sensitiveOnly', e.target.checked)}
            style={{ accentColor: 'var(--canopy)', cursor: 'pointer' }}
          />
          <span style={{
            fontSize: '12px',
            color: 'var(--text-dim)',
            fontFamily: 'Hanken Grotesk, sans-serif',
          }}>
            Near sensitive sites only
          </span>
        </label>
      </div>
    </div>
  );
}
