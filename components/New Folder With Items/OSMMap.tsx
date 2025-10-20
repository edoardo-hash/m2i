// components/OSMMap.tsx (React 18 compatible)
'use client';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

const Inner = dynamic(async () => {
  const rl = await import('react-leaflet');
  const { MapContainer, TileLayer, CircleMarker, Popup } = rl as any;
  return function MapInner({ lat, lng, zoom = 11 }: { lat: number; lng: number; zoom?: number }) {
    return (
      <MapContainer center={[lat, lng]} zoom={zoom} scrollWheelZoom={false} style={{ height: '360px', width: '100%', borderRadius: '16px' }}>
        <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <CircleMarker center={[lat, lng]} radius={10} pathOptions={{ color: '#0ea5e9', weight: 2, fillColor: '#0ea5e9', fillOpacity: 0.7 }}>
          <Popup>Location</Popup>
        </CircleMarker>
      </MapContainer>
    );
  };
}, { ssr: false });

export default function OSMMap({ lat, lng, zoom = 11 }: { lat: number; lng: number; zoom?: number }) {
  return <Inner lat={lat} lng={lng} zoom={zoom} />;
}
