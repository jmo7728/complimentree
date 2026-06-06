'use client';

import { useState } from 'react';
import type { ScoredSite, Weights } from '@/lib/types';
import { scoreToColor } from '@/lib/scoring';

interface Props {
  scored: ScoredSite;
  weights: Weights;
  onClose: () => void;
}

function FactorBar({ label, value, weight }: { label: string; value: number; weight: number }) {
  const contribution = value * weight;
  const pct = Math.round(value * 100);
  return (
    <div style={{ marginBottom: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span style={{
          fontSize: '11px',
          color: 'var(--text-dim)',
          fontFamily: 'Hanken Grotesk, sans-serif',
        }}>
          {label}
        </span>
        <span style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '11px',
          color: 'var(--text)',
        }}>
          {pct}% × {weight.toFixed(2)} = <strong>{(contribution * 100).toFixed(1)}</strong>
        </span>
      </div>
      <div style={{
        height: '6px',
        background: 'var(--border)',
        borderRadius: '3px',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: scoreToColor(pct),
          borderRadius: '3px',
          transition: 'width 0.4s ease',
        }} />
      </div>
    </div>
  );
}

function BenefitRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '6px 0',
      borderBottom: '1px solid var(--border)',
    }}>
      <span style={{
        fontSize: '12px',
        color: 'var(--text-dim)',
        fontFamily: 'Hanken Grotesk, sans-serif',
      }}>
        {label}
      </span>
      <span style={{
        fontFamily: mono !== false ? 'JetBrains Mono, monospace' : 'Hanken Grotesk, sans-serif',
        fontSize: '12px',
        fontWeight: 600,
        color: 'var(--text)',
      }}>
        {value}
      </span>
    </div>
  );
}

export default function SiteDetail({ scored, weights, onClose }: Props) {
  const { site, score, components } = scored;
  const [memo, setMemo] = useState<string | null>(null);
  const [memoError, setMemoError] = useState<string | null>(null);
  const [memoLoading, setMemoLoading] = useState(false);

  const color = scoreToColor(score);
  const bcr = site.planting_cost_usd > 0
    ? (site.total_annual_benefit_usd / site.planting_cost_usd).toFixed(2)
    : 'N/A';

  const handleGenerateMemo = async () => {
    setMemoLoading(true);
    setMemo(null);
    setMemoError(null);
    try {
      const res = await fetch('/api/ai-memo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ site, weights }),
      });
      const data = await res.json();
      if (data.error) {
        setMemoError(data.error);
      } else {
        setMemo(data.memo);
      }
    } catch (e) {
      setMemoError('Failed to generate memo. Check console.');
    } finally {
      setMemoLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content">
        <div style={{ padding: '24px' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div>
              <h2 style={{
                fontFamily: 'Bricolage Grotesque, sans-serif',
                fontWeight: 800,
                fontSize: '22px',
                color: 'var(--text)',
                marginBottom: '4px',
              }}>
                {site.address}
              </h2>
              <p style={{
                fontSize: '13px',
                color: 'var(--text-dim)',
                fontFamily: 'Hanken Grotesk, sans-serif',
              }}>
                {site.neighborhood} · {site.borough} · District {site.community_district}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontWeight: 700,
                  fontSize: '28px',
                  color: color,
                  lineHeight: 1,
                }}>
                  {score.toFixed(1)}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace' }}>
                  SCORE
                </div>
              </div>
              <button
                onClick={onClose}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-dim)',
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                ×
              </button>
            </div>
          </div>

          {/* Status chips */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '20px' }}>
            <span className={`chip ${site.site_status === 'Plantable' ? 'chip-plantable' : 'chip-needs-space'}`} style={{ fontSize: '11px', padding: '3px 10px' }}>
              {site.site_status}
            </span>
            <span className="chip" style={{ fontSize: '11px', padding: '3px 10px' }}>
              HVI {site.heat_vulnerability_index}
            </span>
            <span className="chip" style={{ fontSize: '11px', padding: '3px 10px' }}>
              {site.near_sensitive_site !== 'None' ? `Near: ${site.near_sensitive_site}` : 'No sensitive site'}
            </span>
            <span className="chip" style={{ fontSize: '11px', padding: '3px 10px' }}>
              {site.recommended_species}
            </span>
          </div>

          {/* Score breakdown */}
          <div style={{
            background: 'var(--surface-2)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '14px',
            marginBottom: '16px',
          }}>
            <h4 style={{
              fontFamily: 'Bricolage Grotesque, sans-serif',
              fontWeight: 700,
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--text-dim)',
              marginBottom: '12px',
            }}>
              Score Breakdown
            </h4>
            <FactorBar label="Heat Anomaly" value={components.heat_n} weight={weights.heat} />
            <FactorBar label="Canopy Gap" value={components.gap_n} weight={weights.gap} />
            <FactorBar label="Equity / HVI" value={components.equity_n} weight={weights.equity} />
            <FactorBar label="Sensitive Exposure" value={components.expose_n} weight={weights.exposure} />
          </div>

          {/* i-Tree benefits */}
          <div style={{
            background: 'var(--surface-2)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '14px',
            marginBottom: '16px',
          }}>
            <h4 style={{
              fontFamily: 'Bricolage Grotesque, sans-serif',
              fontWeight: 700,
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--text-dim)',
              marginBottom: '8px',
            }}>
              Estimated Annual Benefits (i-Tree)
            </h4>
            <BenefitRow label="CO₂ Sequestered" value={`${site.annual_co2_seq_lbs} lbs`} />
            <BenefitRow label="Stormwater Managed" value={`${site.annual_stormwater_gal.toLocaleString()} gal`} />
            <BenefitRow label="Air Quality Value" value={`$${site.annual_air_quality_value_usd}`} />
            <BenefitRow label="Energy Savings" value={`$${site.annual_energy_savings_usd}`} />
            <BenefitRow label="Total Annual Benefit" value={`$${site.total_annual_benefit_usd}`} />
            <BenefitRow label="Planting Cost" value={`$${site.planting_cost_usd.toLocaleString()}`} />
            <BenefitRow label="Benefit-to-Cost Ratio" value={`${bcr}×`} />
          </div>

          {/* Additional details */}
          <div style={{
            background: 'var(--surface-2)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '14px',
            marginBottom: '16px',
          }}>
            <h4 style={{
              fontFamily: 'Bricolage Grotesque, sans-serif',
              fontWeight: 700,
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--text-dim)',
              marginBottom: '8px',
            }}>
              Site Details
            </h4>
            <BenefitRow label="5-Year Survival Est." value={`${site.est_survival_5yr_pct}%`} />
            <BenefitRow label="Recommended Species" value={site.recommended_species} mono={false} />
            <BenefitRow label="Area Canopy Cover" value={`${site.area_canopy_pct}%`} />
            <BenefitRow label="Surface Temp Anomaly" value={`${site.surface_temp_anomaly_f > 0 ? '+' : ''}${site.surface_temp_anomaly_f}°F`} />
            <BenefitRow label="Last Nearby Planting" value={`${site.last_nearby_planting_year}`} />
            <div style={{ paddingTop: '8px' }}>
              <p style={{
                fontSize: '12px',
                color: 'var(--text-dim)',
                fontStyle: 'italic',
                lineHeight: '1.5',
                fontFamily: 'Hanken Grotesk, sans-serif',
              }}>
                "{site.planner_notes}"
              </p>
            </div>
          </div>

          {/* AI Memo */}
          <div style={{ marginBottom: '16px' }}>
            <button
              onClick={handleGenerateMemo}
              disabled={memoLoading}
              style={{
                width: '100%',
                padding: '11px',
                background: memoLoading ? 'var(--canopy-deep)' : 'var(--surface-2)',
                border: `1px solid ${memo ? 'var(--canopy)' : 'var(--border)'}`,
                borderRadius: '8px',
                color: memoLoading ? 'rgba(255,255,255,0.6)' : 'var(--canopy)',
                fontWeight: 700,
                fontSize: '13px',
                cursor: memoLoading ? 'not-allowed' : 'pointer',
                fontFamily: 'Bricolage Grotesque, sans-serif',
                transition: 'all 0.2s',
              }}
            >
              {memoLoading ? '✦ Generating justification memo...' : '✦ Generate justification memo'}
            </button>

            {memoError && (
              <div style={{
                marginTop: '10px',
                padding: '12px',
                background: 'rgba(255,92,60,0.08)',
                border: '1px solid rgba(255,92,60,0.2)',
                borderRadius: '8px',
                fontSize: '12px',
                color: 'var(--hot)',
                fontFamily: 'Hanken Grotesk, sans-serif',
              }}>
                {memoError}
              </div>
            )}

            {memo && (
              <div style={{
                marginTop: '10px',
                padding: '14px',
                background: 'rgba(91, 217, 128, 0.05)',
                border: '1px solid rgba(91, 217, 128, 0.15)',
                borderRadius: '8px',
              }}>
                <p style={{
                  fontSize: '13px',
                  color: 'var(--text)',
                  lineHeight: '1.6',
                  fontFamily: 'Hanken Grotesk, sans-serif',
                  whiteSpace: 'pre-wrap',
                }}>
                  {memo}
                </p>
              </div>
            )}
          </div>

          {/* Weights stamp */}
          <div style={{
            padding: '10px 12px',
            background: 'var(--surface-2)',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '10px',
            color: 'var(--text-dim)',
          }}>
            Weights at time of view: Heat {weights.heat.toFixed(2)} | Gap {weights.gap.toFixed(2)} | Equity {weights.equity.toFixed(2)} | Exposure {weights.exposure.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
}
