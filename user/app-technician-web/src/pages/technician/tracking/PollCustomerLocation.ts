import { useEffect, useState } from "react";
import axios from "axios";

type LatLng = { lat: number; lng: number };

function useCustomerLocation({ requestId }: { requestId: string }) {
  const [location, setLocation] = useState<LatLng>({ lat: 0, lng: 0 });

  useEffect(() => {
    if (!requestId) return;

    const base = (import.meta.env.VITE_LOCATION_API_BASE_URL as string || "").replace(/\/$/, "");
    const url = `${base}/api/customer_location`;

    const fetchLocation = async () => {
      try {
        const response = await axios.get(url, { params: { requestId } });
        const { lat, lng } = response.data || {};
        if (typeof lat === "number" && typeof lng === "number") {
          setLocation({ lat, lng });
        }
      } catch (err) {
        console.error("GET /api/customer_location failed:", err);
      }
    };

    fetchLocation();
    const intervalId = setInterval(fetchLocation, 10000);
    return () => clearInterval(intervalId);
  }, [requestId]);
  return location;
}

export { useCustomerLocation };

