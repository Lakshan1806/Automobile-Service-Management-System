"use client";
import Map from "@/components/LocationMap";
import { useLocationWatcher } from "@/components/PollLocation";

export default function Home() {
  const location = useLocationWatcher();
  return (
    <div className="h-dvh">
      <Map center={location} />
    </div>
  );
}
