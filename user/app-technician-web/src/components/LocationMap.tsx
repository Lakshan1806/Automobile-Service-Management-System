"use client";

import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
} from "@vis.gl/react-google-maps";

function LocationMap({
  currentLocation: { lat: userLat, lng: userLng },
  customerLocation: { lat: customerLat, lng: customerLng },
}: {
  currentLocation: { lat: number; lng: number };
  customerLocation: { lat: number; lng: number };
}) {
  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
      <Map
        className="w-full h-full"
        center={{ lat: userLat, lng: userLng }}
        defaultZoom={16}
        gestureHandling="greedy"
        disableDefaultUI
        mapId={process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID}
      >
        <AdvancedMarker position={{ lat: userLat, lng: userLng }} />
        <AdvancedMarker position={{ lat: customerLat, lng: customerLng }}>
          <Pin
            background={"#0f9d58"}
            borderColor={"#006425"}
            glyphColor={"#60d98f"}
          />
        </AdvancedMarker>
      </Map>
    </APIProvider>
  );
}

export default LocationMap;
