"use client";
import Map from "@/components/LocationMap";
import { useLocationWatcher } from "@/components/PollTechnicianLocation";
import { useCustomerLocation } from "@/components/PollCustomerLocation";

export default function Home() {
  const currentLocation = useLocationWatcher();
  const customerLocation = useCustomerLocation();
  return (
    <div className="h-dvh">
      <Map currentLocation={currentLocation} customerLocation={customerLocation} />
    </div>
  );
}
