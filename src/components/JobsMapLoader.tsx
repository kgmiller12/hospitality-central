"use client";

import dynamic from "next/dynamic";
import type { MapJob } from "./JobsMap";

// Leaflet needs the browser's window object, so the map only renders client-side.
const JobsMap = dynamic(() => import("./JobsMap"), {
  ssr: false,
  loading: () => <div className="h-[420px] animate-pulse rounded-xl bg-stone-200" />,
});

export default function JobsMapLoader({ jobs }: { jobs: MapJob[] }) {
  return <JobsMap jobs={jobs} />;
}
