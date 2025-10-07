"use client";
import { useEffect, useState } from "react";
import axios from "axios";

function useLocationWatcher() {
  const [location, setLocation] = useState<{ lat: number; lng: number }>({
    lat: 0,
    lng: 0,
  });

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      console.error("Geolocation not supported");
      return;
    }
    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        
        setLocation({ lat: latitude, lng: longitude });
        try {
          await axios.patch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/location`, {
            lat: latitude,
            lng: longitude,
            customerId: "cus_003",
            requestId: "68e350f894c77c1f8bab2710",
          });
        } catch (err) {
          console.error("POST /api/locations failed:", err);
        }
      },
      (err) => {
        console.error("Geolocation error:", err);
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);
  return location;
}

export { useLocationWatcher };
