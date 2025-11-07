"use client";

import Map from "@/components/LocationMap";
import { useLocationWatcher } from "@/components/PollCustomerLocation";
import { useTechnicianLocation } from "@/components/PollTechnicianLocation";
import { Protected } from "@/app/auth/Protected";

function TrackingContent() {
  const currentLocation = useLocationWatcher();
  const technicianLocation = useTechnicianLocation();

  return (
    <div className="h-dvh">
      <Map
        currentLocation={currentLocation}
        technicianLocation={technicianLocation}
      />
    </div>
  );
}

export default function TrackingPage() {
  return (
    <Protected redirectTo="/tracking">
      <TrackingContent />
    </Protected>
  );
}
