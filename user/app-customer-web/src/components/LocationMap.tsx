"use client";

import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";

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
        className="w-full h-full"
        defaultCenter={{ lat: userLat, lng: userLng }}
        defaultZoom={16}
        gestureHandling="greedy"
        disableDefaultUI
        mapId={process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID}
      >
        <AdvancedMarker position={{ lat: userLat, lng: userLng }} />
        <AdvancedMarker position={{ lat: techLat, lng: techLng }} />
      </Map>
    </APIProvider>
  );
}

export default LocationMap;
