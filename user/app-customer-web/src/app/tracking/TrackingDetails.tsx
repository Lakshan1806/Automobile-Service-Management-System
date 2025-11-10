// File: src/app/tracking/TrackingDetails.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/app/auth/AuthContext";
import { Protected } from "@/app/auth/Protected";
import { readActiveRequest } from "@/app/roadside-assistance/activeRequestStorage";
import Map from "@/components/LocationMap";
import { useLocationWatcher } from "@/components/PollCustomerLocation";
import { useTechnicianLocation } from "@/components/PollTechnicianLocation";

type LatLng = { lat: number; lng: number };

function isValidLocation(location: LatLng | null): location is LatLng {
  return (
    location !== null &&
    Number.isFinite(location.lat) &&
    Number.isFinite(location.lng)
  );
}

export default function TrackingDetails() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const requestIdFromURL = searchParams.get("requestId");
  const { customer } = useAuth();
  const [activeRequestId, setActiveRequestId] = useState<string | null>(null);

  // Load request ID
  useEffect(() => {
    if (requestIdFromURL) {
      setActiveRequestId(requestIdFromURL);
      return;
    }
    const stored = readActiveRequest();
    if (stored?.requestId) {
      setActiveRequestId(stored.requestId);
    } else {
      router.replace("/roadside-assistance");
    }
  }, [requestIdFromURL, router]);

  // --- 👇 FIX: HOOKS MOVED TO TOP ---
  // Hooks MUST be called on every render, before any early returns.
  // We pass 'activeRequestId' (which might be null) to them.
  // The custom hooks should be designed to handle a null requestId.
  const currentLocation = useLocationWatcher({
    requestId: activeRequestId,
    customerId: customer?.id,
  });
  const technicianLocation = useTechnicianLocation({
    requestId: activeRequestId,
  });
  // --- 👆 END OF FIX 👆 ---

  // --- 👇 FIX: GUARD CLAUSE (early return) MOVED DOWN 👇 ---
  // Now we can return early, *after* all hooks have been called.
  if (!activeRequestId) {
    return <div>Loading request...</div>;
  }

  const hasUserLocation = isValidLocation(currentLocation);
  const hasTechnicianLocation = isValidLocation(technicianLocation);

  return (
    <Protected redirectTo={`/tracking?requestId=${encodeURIComponent(activeRequestId)}`}>
      {!hasUserLocation ? (
        <div className="h-dvh flex items-center justify-center text-sm text-neutral-500">
          Locating vehicles...
        </div>
      ) : (
        <div className="relative h-dvh">
          <Map
            currentLocation={currentLocation}
            technicianLocation={hasTechnicianLocation ? technicianLocation : null}
          />
          {!hasTechnicianLocation && (
            <div className="pointer-events-none absolute bottom-4 left-1/2 w-full max-w-md -translate-x-1/2 rounded-full bg-black/70 px-4 py-2 text-center text-xs font-medium text-white">
              Waiting for the technician to share their location...
            </div>
          )}
        </div>
      )}
    </Protected>
  );
}