"use client";

import Map from "@/components/LocationMap";
import { useLocationWatcher } from "@/components/PollCustomerLocation";
import { useTechnicianLocation } from "@/components/PollTechnicianLocation";

export default function TrackingPage() {
  const currentLocation = useLocationWatcher();
  const technicianLocation = useTechnicianLocation();

  return (
    <div className="h-dvh">
      <Map currentLocation={currentLocation} technicianLocation={technicianLocation} />
    </div>
  );
}
