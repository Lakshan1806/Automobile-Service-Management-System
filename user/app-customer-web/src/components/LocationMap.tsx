"use client";

import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";

function LocationMap({
  center: { lat, lng },
}: {
  center: { lat: number; lng: number };
}) {
  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
      <Map
        className="w-full h-full"
        defaultCenter={{ lat, lng }}
        defaultZoom={16}
        gestureHandling="greedy"
        disableDefaultUI
        mapId={process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID}
      >
        <AdvancedMarker position={{ lat, lng }} />
      </Map>
    </APIProvider>
  );
}

export default LocationMap;
