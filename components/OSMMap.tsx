// components/OSMMap.tsx
// React 18 compatible, lazy-in-viewport, tiny bundle
'use client';
import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

// Lazy mount only when scrolled into view
function useInViewport<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current || inView) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setInView(true);
    }, { rootMargin: '200px' });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [inView]);
  return { ref, inView };
}

// React‑Leaflet (v4) dynamic chunk
const Inner = dynamic(async () => {
  const rl = await import('react-leaflet');
  const { MapContainer, TileLayer, CircleMarker, Popup, ZoomControl } = rl as any;
  return function MapInner({ lat, lng, zoom = 11 }: { lat: number; lng: number; zoom?: number }) {
    return (
      <MapContainer
        center={[lat, lng]}
        zoom={zoom}
        zoomControl={false}
        scrollWheelZoom={false}
        style={{ height: '360px', width: '100%', borderRadius: '16px' }}
      >
        <ZoomControl position="topright" />
        <TileLayer
          // Multiple tile servers for resiliency
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          // Browser caching hints
          tileSize={256}
          detectRetina={true}
        />
        {/* Circle marker avoids external icon assets */}
        <CircleMarker center={[lat, lng]} radius={10} pathOptions={{ color: '#0ea5e9', weight: 2, fillColor: '#0ea5e9', fillOpacity: 0.8 }}>
          <Popup>Location</Popup>
        </CircleMarker>
      </MapContainer>
    );
  };
}, { ssr: false });

export default function OSMMap({ lat, lng, zoom = 8 }: { lat: number; lng: number; zoom?: number }) {
  const { ref, inView } = useInViewport<HTMLDivElement>();
  return (
    <div ref={ref} className="w-full" style={{ minHeight: 360 }}>
      {inView ? <Inner lat={lat} lng={lng} zoom={zoom} /> : (
        <div className="h-[360px] w-full rounded-2xl bg-slate-100 animate-pulse" />
      )}
    </div>
  );
}
