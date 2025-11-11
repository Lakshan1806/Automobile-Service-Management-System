import { useEffect, useState } from "react";
import axios from "axios";

type LatLng = { lat: number; lng: number };

function useLocationWatcher({ requestId, technicianId }: { requestId: string; technicianId: string }) {
  const [location, setLocation] = useState<LatLng>({ lat: 0, lng: 0 });

  useEffect(() => {
    if (!requestId || !technicianId) return;
    if (!("geolocation" in navigator)) {
      console.error("Geolocation not supported");
      return;
    }

    const base = (import.meta.env.VITE_LOCATION_API_BASE_URL as string || "").replace(/\/$/, "");
    const url = `${base}/api/location`;

    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;

        setLocation({ lat: latitude, lng: longitude });
        try {
          await axios.patch(url, {
            lat: latitude,
            lng: longitude,
            technicianId,
            requestId,
          });
        } catch (err) {
          console.error("PATCH /api/location failed:", err);
        }
      },
      (err) => {
        console.error("Geolocation error:", err);
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [requestId, technicianId]);
  return location;
}

export { useLocationWatcher };

