"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";

export type MapJob = {
  id: number;
  title: string;
  company: string;
  description: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  applyUrl: string;
};

export default function JobsMap({ jobs }: { jobs: MapJob[] }) {
  return (
    <MapContainer center={[39.5, -98.35]} zoom={4} scrollWheelZoom={false} className="h-[420px] w-full rounded-xl">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {jobs.map((j) => (
        <CircleMarker
          key={j.id}
          center={[j.lat, j.lng]}
          radius={9}
          pathOptions={{ color: "#0f2a44", fillColor: "#c8a24a", fillOpacity: 0.9, weight: 2 }}
        >
          <Popup>
            <p className="font-semibold">{j.company}</p>
            <p>{j.title} · {j.city}, {j.state}</p>
            <p className="text-xs">{j.description.slice(0, 120)}{j.description.length > 120 && "…"}</p>
            <a href={j.applyUrl} target="_blank" rel="noreferrer">Apply →</a>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
