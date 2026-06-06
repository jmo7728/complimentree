'use client';

import type { Weights } from '@/lib/types';

interface Props {
  weights: Weights;
  onChange: (w: Weights) => void;
}

function SliderRow({
  label,
  value,
  field,
  onChange,
  isEquity,
}: {
  label: string;
  value: number;
  field: keyof Weights;
  onChange: (field: keyof Weights, val: number) => void;
  isEquity?: boolean;
}) {
  return (
    <div style={{ marginBottom: isEquity ? '18px' : '14px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: '5px',
      }}>
        <label style={{
          fontFamily: isEquity ? 'Bricolage Grotesque, sans-serif' : 'Hanken Grotesk, sans-serif',
          fontWeight: isEquity ? 700 : 600,
          fontSize: isEquity ? '13px' : '12px',
          color: isEquity ? 'var(--canopy)' : 'var(--text-dim)',
          letterSpacing: isEquity ? '0.01em' : '0.02em',
          textShadow: isEquity ? '0 0 12px rgba(91,217,128,0.35)' : 'none',
        }}>
          {label}
        </label>
        <span style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '11px',
          color: isEquity ? 'var(--canopy)' : 'var(--text)',
          fontWeight: 600,
        }}>
          {value.toFixed(2)}
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={1}
        step={0.05}
        value={value}
        className={isEquity ? 'equity-slider' : ''}
        onChange={e => onChange(field, parseFloat(e.target.value))}
        style={{ width: '100%' }}
      />
    </div>
  );
}

export default function WeightSliders({ weights, onChange }: Props) {
  const handleChange = (field: keyof Weights, val: number) => {
    onChange({ ...weights, [field]: val });
  };

  const sum = weights.heat + weights.gap + weights.equity + weights.exposure;
  const sumColor = Math.abs(sum - 1.0) < 0.001 ? 'var(--canopy)' : 'var(--warm)';

  return (
    <div style={{ padding: '16px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
      }}>
        <h3 style={{
          fontFamily: 'Bricolage Grotesque, sans-serif',
          fontWeight: 700,
          fontSize: '13px',
          color: 'var(--text)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}>
          Priority Weights
        </h3>
        <span style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '10px',
          color: sumColor,
        }}>
          Σ {sum.toFixed(2)}
        </span>
      </div>

      <SliderRow
        label="Heat Anomaly"
        value={weights.heat}
        field="heat"
        onChange={handleChange}
      />
      <SliderRow
        label="Canopy Gap"
        value={weights.gap}
        field="gap"
        onChange={handleChange}
      />
      <SliderRow
        label="Equity / Heat Vulnerability"
        value={weights.equity}
        field="equity"
        onChange={handleChange}
        isEquity
      />
      <SliderRow
        label="Sensitive Exposure"
        value={weights.exposure}
        field="exposure"
        onChange={handleChange}
      />

      {/* Guardrail notice */}
      <div style={{
        marginTop: '16px',
        padding: '10px 12px',
        background: 'rgba(91, 217, 128, 0.06)',
        border: '1px solid rgba(91, 217, 128, 0.15)',
        borderRadius: '6px',
      }}>
        <p style={{
          fontSize: '10px',
          color: 'var(--text-dim)',
          lineHeight: '1.5',
          fontFamily: 'Hanken Grotesk, sans-serif',
        }}>
          <span style={{ color: 'var(--canopy)', fontWeight: 700 }}>GUARDRAIL</span>
          {' '}Active weights are visible and stamped on all exports — your value choices are auditable.
        </p>
      </div>
    </div>
  );
}
