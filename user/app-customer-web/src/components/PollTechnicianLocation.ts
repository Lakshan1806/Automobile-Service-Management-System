"use client";
import { useEffect, useState } from "react";
import { locationApi } from "@/app/auth/api";

type LatLng = { lat: number; lng: number };
type TechnicianLocationOptions = {
  requestId?: string | null;
};

function useTechnicianLocation(options: TechnicianLocationOptions) {
  const { requestId } = options;
  const [location, setLocation] = useState<LatLng | null>(null);

  useEffect(() => {
    if (!requestId) {
      return;
    }

    const fetchLocation = async () => {
      try {
        const response = await locationApi.get("/api/technician_location", {
          params: { requestId },
        });
        const { lat, lng } = response.data;
        if (typeof lat === "number" && typeof lng === "number") {
          setLocation({ lat, lng });
        } else {
          setLocation(null);
        }
      } catch (err) {
        console.error("GET /api/technician_location failed:", err);
      }
    };

    fetchLocation();
    const intervalId = setInterval(fetchLocation, 10000);
    return () => clearInterval(intervalId);
  }, [requestId]);

  return location;
}

export { useTechnicianLocation };
