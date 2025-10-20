"use client";

import {
  APIProvider,
  Map,
  AdvancedMarker,
  useMap,
} from "@vis.gl/react-google-maps";
import Image from "next/image";

function LocationMap({
  currentLocation: { lat: userLat, lng: userLng },
  technicianLocation: { lat: techLat, lng: techLng },
}: {
  currentLocation: { lat: number; lng: number };
  technicianLocation: { lat: number; lng: number };
}) {
  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
      <Map
        className="h-full w-full"
        center={{ lat: userLat, lng: userLng }}
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
        <AdvancedMarker position={{ lat: techLat, lng: techLng }}>
          <Image
            src="/assets/tow-vehicle.png"
            alt="Tow Vehicle"
            width={64}
            height={64}
          />
        </AdvancedMarker>
      </Map>
    </APIProvider>
  );
}

export default LocationMap;
