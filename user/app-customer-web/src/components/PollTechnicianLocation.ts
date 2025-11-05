"use client";
import { useEffect, useState } from "react";
import axios from "axios";

function useTechnicianLocation() {
  const [location, setLocation] = useState<{ lat: number; lng: number }>({
    lat: 0,
    lng: 0,
  });

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/technician_location`,
          {
            params: { requestId: "68e350f894c77c1f8bab2710" },
          }
        );
        const { lat, lng } = response.data;
        setLocation({ lat, lng });
      } catch (err) {
        console.error("GET /api/technician-location failed:", err);
      }
    };

    fetchLocation();
    const intervalId = setInterval(fetchLocation, 10000);
    return () => clearInterval(intervalId);
  }, []);
  return location;
}

export { useTechnicianLocation };
