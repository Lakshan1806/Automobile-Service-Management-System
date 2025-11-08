"use client";

import {
  APIProvider,
  Map,
  AdvancedMarker,
  useMap,
} from "@vis.gl/react-google-maps";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { locationApi } from "@/app/auth/api";

type LatLng = { lat: number; lng: number };

async function fetchRoute(origin: LatLng, destination: LatLng) {
  const response = await locationApi.post(
    "/api/route",
    {
      origin,
      destination,
      mode: "DRIVE",
    },
  );
  if (!response) throw new Error("Route fetch failed");
  return response.data;
}

function PolylineOverlay({ path }: { path: LatLng[] | null }) {
  const map = useMap();
  useEffect(() => {
    if (!map || !path?.length) return;
    const pl = new google.maps.Polyline({
      path,
      strokeWeight: 5,
      strokeOpacity: 1.0,
    });
    pl.setMap(map);
    return () => pl.setMap(null);
  }, [map, path]);
  return null;
}

type LocationMapProps = {
  currentLocation: LatLng;
  technicianLocation?: LatLng | null;
};

function LocationMap({
  currentLocation,
  technicianLocation,
}: LocationMapProps) {
  const { lat: userLat, lng: userLng } = currentLocation;
  const techLat = technicianLocation?.lat ?? null;
  const techLng = technicianLocation?.lng ?? null;
  const hasTechnicianLocation =
    techLat !== null &&
    techLng !== null &&
    Number.isFinite(techLat) &&
    Number.isFinite(techLng);

  const [path, setPath] = useState<LatLng[] | null>(null);

  const center = useMemo<LatLng>(
    () =>
      hasTechnicianLocation
        ? {
            lat: (userLat + techLat) / 2,
            lng: (userLng + techLng) / 2,
          }
        : { lat: userLat, lng: userLng },
    [hasTechnicianLocation, userLat, userLng, techLat, techLng],
  );

  useEffect(() => {
    if (!hasTechnicianLocation || techLat === null || techLng === null) {
      setPath(null);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const { polyline } = await fetchRoute(
          { lat: techLat, lng: techLng },
          { lat: userLat, lng: userLng },
        );
        const decoded = (
          window as Window & typeof globalThis & { google: typeof google }
        ).google.maps.geometry.encoding
          .decodePath(polyline)
          .map((ll: google.maps.LatLng) => ({ lat: ll.lat(), lng: ll.lng() }));

        if (!cancelled) {
          setPath(decoded);
        }
      } catch (e) {
        console.error(e);
        if (!cancelled) {
          setPath(null);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [hasTechnicianLocation, techLat, techLng, userLat, userLng]);

  return (
    <APIProvider
      apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}
      libraries={["geometry"]}
    >
      <Map
        className="h-full w-full"
        center={center}
        defaultZoom={16}
        gestureHandling="greedy"
        disableDefaultUI
        mapId={process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID}
      >
        <AdvancedMarker position={{ lat: userLat, lng: userLng }}>
          <Image
            src="/assets/user-vehicle.png"
            alt="User Vehicle"
            width={64}
            height={64}
          />
        </AdvancedMarker>
        {hasTechnicianLocation && techLat !== null && techLng !== null && (
          <AdvancedMarker position={{ lat: techLat, lng: techLng }}>
            <Image
              src="/assets/tow-vehicle.png"
              alt="Tow Vehicle"
              width={64}
              height={64}
            />
          </AdvancedMarker>
        )}

        <PolylineOverlay path={path} />
      </Map>
    </APIProvider>
  );
}

export default LocationMap;
