'use client';

import { useState } from 'react';
import type { Weights, PlantingSite } from '@/lib/types';

interface Props {
  weights: Weights;
  sites: PlantingSite[];
  onResult: (result: {
    rationale: string;
    adjustedWeights?: Weights | null;
    highlightedSiteIds?: string[];
    appliedFiltersDescription: string;
  }) => void;
  onClear: () => void;
  rationale: string;
  appliedFiltersDesc: string;
}

export default function QueryBar({ weights, sites, onResult, onClear, rationale, appliedFiltersDesc }: Props) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, weights, sites }),
      });
      const data = await res.json();
      onResult(data);
    } catch {
      setError('Failed to process query.');
    } finally {
      setLoading(false);
    }
  };

  const hasResult = rationale || appliedFiltersDesc;

  return (
    <div style={{ padding: '12px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '8px',
      }}>
        <h3 style={{
          fontFamily: 'Bricolage Grotesque, sans-serif',
          fontWeight: 700,
          fontSize: '12px',
          color: 'var(--text)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}>
          AI Query
        </h3>
        {hasResult && (
          <button
            onClick={() => { onClear(); setQuery(''); setError(null); }}
            style={{
              fontSize: '10px',
              color: 'var(--text-dim)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'Hanken Grotesk, sans-serif',
            }}
          >
            Clear
          </button>
        )}
      </div>

      <textarea
        value={query}
        onChange={e => setQuery(e.target.value)}
        rows={3}
        placeholder={'e.g. "40 trees this quarter — prioritize near schools, skip sites planted since 2024"'}
        onKeyDown={e => {
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit();
        }}
      />

      <button
        onClick={handleSubmit}
        disabled={loading || !query.trim()}
        style={{
          marginTop: '8px',
          width: '100%',
          padding: '8px',
          background: loading ? 'var(--canopy-deep)' : 'var(--canopy)',
          color: '#0B0F0E',
          fontWeight: 700,
          fontSize: '12px',
          border: 'none',
          borderRadius: '6px',
          cursor: loading || !query.trim() ? 'not-allowed' : 'pointer',
          fontFamily: 'Bricolage Grotesque, sans-serif',
          opacity: !query.trim() ? 0.5 : 1,
          transition: 'opacity 0.2s',
        }}
      >
        {loading ? 'Processing...' : 'Apply Query ↵'}
      </button>

      {error && (
        <div style={{
          marginTop: '8px',
          fontSize: '11px',
          color: 'var(--hot)',
          fontFamily: 'Hanken Grotesk, sans-serif',
        }}>
          {error}
        </div>
      )}

      {hasResult && (
        <div style={{
          marginTop: '10px',
          padding: '10px',
          background: 'rgba(91, 217, 128, 0.06)',
          border: '1px solid rgba(91, 217, 128, 0.15)',
          borderRadius: '6px',
        }}>
          {rationale && (
            <p style={{
              fontSize: '11px',
              color: 'var(--text)',
              lineHeight: '1.5',
              marginBottom: appliedFiltersDesc ? '6px' : 0,
              fontFamily: 'Hanken Grotesk, sans-serif',
            }}>
              {rationale}
            </p>
          )}
          {appliedFiltersDesc && (
            <p style={{
              fontSize: '10px',
              color: 'var(--canopy)',
              fontFamily: 'JetBrains Mono, monospace',
            }}>
              Applied: {appliedFiltersDesc}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
