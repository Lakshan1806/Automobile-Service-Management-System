"use client";
import { useEffect, useState } from "react";
import { locationApi } from "@/app/auth/api";

type LatLng = { lat: number; lng: number };
type LocationWatcherOptions = {
  requestId?: string | null;
  customerId?: string | null;
};

function useLocationWatcher(options: LocationWatcherOptions) {
  const { requestId, customerId } = options;
  const [location, setLocation] = useState<LatLng | null>(null);

  useEffect(() => {
    if (!requestId || !customerId) {
      return;
    }

    if (!("geolocation" in navigator)) {
      console.error("Geolocation not supported");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;

        setLocation({ lat: latitude, lng: longitude });
        try {
          await locationApi.patch("/api/location", {
            lat: latitude,
            lng: longitude,
            customerId,
            requestId,
          });
        } catch (err) {
          console.error("PATCH /api/location failed:", err);
        }
      },
      (err) => {
        console.error("Geolocation error:", err);
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [requestId, customerId]);

  return location;
}

export { useLocationWatcher };
