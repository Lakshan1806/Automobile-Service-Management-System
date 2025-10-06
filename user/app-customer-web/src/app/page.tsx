"use client";
import Map from "@/components/LocationMap";
import { useLocationWatcher } from "@/components/PollCustomerLocation";

export default function Home() {
  const currentLocation = useLocationWatcher();
  const technicianLocation = useLocationWatcher();
  return (
    <div className="h-dvh">
      <Map currentLocation={currentLocation} technicianLocation={technicianLocation} />
    </div>
  );
}
