'use client';

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import type { ScoredSite } from '@/lib/types';
import { scoreToColor } from '@/lib/scoring';
import 'leaflet/dist/leaflet.css';

interface Props {
  sites: ScoredSite[];
  onSiteClick: (site: ScoredSite) => void;
  highlightedIds: string[];
}

function FitBounds({ sites }: { sites: ScoredSite[] }) {
  const map = useMap();
  const prevCount = useRef(0);

  useEffect(() => {
    if (sites.length === 0) return;
    if (sites.length === prevCount.current) return;
    prevCount.current = sites.length;

    const lats = sites.map(s => s.site.latitude);
    const lngs = sites.map(s => s.site.longitude);
    const bounds: [[number, number], [number, number]] = [
      [Math.min(...lats) - 0.01, Math.min(...lngs) - 0.01],
      [Math.max(...lats) + 0.01, Math.max(...lngs) + 0.01],
    ];
    map.fitBounds(bounds, { padding: [20, 20] });
  }, [sites, map]);

  return null;
}

export default function MapView({ sites, onSiteClick, highlightedIds }: Props) {
  return (
    <MapContainer
      center={[40.73, -73.9]}
      zoom={11}
      style={{ height: '100%', width: '100%' }}
      zoomControl={true}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        subdomains="abcd"
        maxZoom={20}
      />
      <FitBounds sites={sites} />
      {sites.map(scored => {
        const { site, score } = scored;
        const color = scoreToColor(score);
        const radius = 6 + (score / 100) * 10;
        const isHighlighted = highlightedIds.length === 0 || highlightedIds.includes(site.site_id);

        return (
          <CircleMarker
            key={site.site_id}
            center={[site.latitude, site.longitude]}
            radius={radius}
            pathOptions={{
              color: color,
              fillColor: color,
              fillOpacity: isHighlighted ? 0.85 : 0.25,
              weight: isHighlighted ? 1.5 : 0.5,
              opacity: isHighlighted ? 1 : 0.4,
            }}
          >
            <Popup>
              <div style={{
                fontFamily: 'Hanken Grotesk, sans-serif',
                minWidth: '180px',
              }}>
                <div style={{
                  fontFamily: 'Bricolage Grotesque, sans-serif',
                  fontWeight: 700,
                  fontSize: '14px',
                  marginBottom: '4px',
                  color: 'var(--text)',
                }}>
                  {site.address}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: 'var(--text-dim)',
                  marginBottom: '8px',
                }}>
                  {site.neighborhood}, {site.borough}
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '10px',
                }}>
                  <span style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontWeight: 700,
                    fontSize: '18px',
                    color: color,
                  }}>
                    {score.toFixed(1)}
                  </span>
                  <span style={{
                    fontSize: '11px',
                    color: 'var(--text-dim)',
                  }}>
                    priority score
                  </span>
                </div>
                <div style={{
                  fontSize: '11px',
                  color: 'var(--text-dim)',
                  marginBottom: '10px',
                }}>
                  HVI {site.heat_vulnerability_index} · {site.area_canopy_pct}% canopy · {site.surface_temp_anomaly_f > 0 ? '+' : ''}{site.surface_temp_anomaly_f}°F
                </div>
                <button
                  onClick={() => onSiteClick(scored)}
                  style={{
                    background: 'var(--canopy)',
                    color: '#0B0F0E',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    fontWeight: 700,
                    fontSize: '12px',
                    cursor: 'pointer',
                    width: '100%',
                    fontFamily: 'Hanken Grotesk, sans-serif',
                  }}
                >
                  View details
                </button>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
