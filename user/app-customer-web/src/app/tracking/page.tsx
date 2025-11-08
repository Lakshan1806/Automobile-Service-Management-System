"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Map from "@/components/LocationMap";
import { useLocationWatcher } from "@/components/PollCustomerLocation";
import { useTechnicianLocation } from "@/components/PollTechnicianLocation";
import { Protected } from "@/app/auth/Protected";
import { useAuth } from "@/app/auth/AuthContext";
import { readActiveRequest } from "@/app/roadside-assistance/activeRequestStorage";

type TrackingContentProps = {
  requestId: string;
};

type LatLng = { lat: number; lng: number };

function isValidLocation(location: LatLng | null): location is LatLng {
  return (
    location !== null &&
    Number.isFinite(location.lat) &&
    Number.isFinite(location.lng)
  );
}

function TrackingContent({ requestId }: TrackingContentProps) {
  const { customer } = useAuth();
  const currentLocation = useLocationWatcher({
    requestId,
    customerId: customer?.id,
  });
  const technicianLocation = useTechnicianLocation({ requestId });

  const hasUserLocation = isValidLocation(currentLocation);
  const hasTechnicianLocation = isValidLocation(technicianLocation);

  if (!hasUserLocation) {
    return (
      <div className="h-dvh flex items-center justify-center text-sm text-neutral-500">
        Locating vehicles...
      </div>
    );
  }

  return (
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
  );
}

export default function TrackingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchRequestId = searchParams.get("requestId");
  const [activeRequestId, setActiveRequestId] = useState<string | null>(null);

  useEffect(() => {
    if (searchRequestId) {
      setActiveRequestId(searchRequestId);
      return;
    }

    const stored = readActiveRequest();
    if (stored?.requestId) {
      setActiveRequestId(stored.requestId);
    } else {
      router.replace("/roadside-assistance");
    }
  }, [searchRequestId, router]);

  if (!activeRequestId) {
    return null;
  }

  const redirectTarget = `/tracking?requestId=${encodeURIComponent(activeRequestId)}`;

  return (
    <Protected redirectTo={redirectTarget}>
      <TrackingContent requestId={activeRequestId} />
    </Protected>
  );
}
