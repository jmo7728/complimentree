'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem('canopyiq_user');
    if (user) router.replace('/');
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    localStorage.setItem('canopyiq_user', email.trim());
    setTimeout(() => router.replace('/'), 300);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '12px',
          }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, var(--canopy-deep), var(--canopy))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
            }}>
              🌳
            </div>
            <h1 style={{
              fontFamily: 'Bricolage Grotesque, sans-serif',
              fontWeight: 800,
              fontSize: '28px',
              color: 'var(--text)',
              letterSpacing: '-0.02em',
            }}>
              CANOPY<span style={{ color: 'var(--canopy)' }}>IQ</span>
            </h1>
          </div>
          <p style={{
            color: 'var(--text-dim)',
            fontSize: '14px',
            fontFamily: 'Hanken Grotesk, sans-serif',
          }}>
            NYC Heat Resilience Decision Support
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '32px',
        }}>
          <h2 style={{
            fontFamily: 'Bricolage Grotesque, sans-serif',
            fontWeight: 700,
            fontSize: '20px',
            marginBottom: '8px',
            color: 'var(--text)',
          }}>
            Sign in to continue
          </h2>
          <p style={{
            color: 'var(--text-dim)',
            fontSize: '13px',
            marginBottom: '28px',
          }}>
            Demo access — no password required
          </p>

          <form onSubmit={handleSubmit}>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--text-dim)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '8px',
            }}>
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="planner@nyc.gov"
              required
              style={{
                width: '100%',
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '12px 14px',
                color: 'var(--text)',
                fontSize: '14px',
                fontFamily: 'Hanken Grotesk, sans-serif',
                outline: 'none',
                marginBottom: '20px',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => { e.target.style.borderColor = 'var(--canopy)'; }}
              onBlur={e => { e.target.style.borderColor = 'var(--border)'; }}
            />
            <button
              type="submit"
              disabled={loading || !email.trim()}
              style={{
                width: '100%',
                background: loading ? 'var(--canopy-deep)' : 'var(--canopy)',
                color: '#0B0F0E',
                fontWeight: 700,
                fontSize: '14px',
                padding: '12px',
                borderRadius: '8px',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'Bricolage Grotesque, sans-serif',
                transition: 'opacity 0.2s, transform 0.1s',
                opacity: !email.trim() ? 0.5 : 1,
              }}
            >
              {loading ? 'Entering...' : 'Access Dashboard'}
            </button>
          </form>
        </div>

        <p style={{
          textAlign: 'center',
          color: 'var(--text-dim)',
          fontSize: '11px',
          marginTop: '20px',
          fontFamily: 'JetBrains Mono, monospace',
        }}>
          DEMO DATA — FOR ILLUSTRATIVE PURPOSES ONLY
        </p>
      </div>
    </div>
  );
}
