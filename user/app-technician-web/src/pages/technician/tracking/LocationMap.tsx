import { APIProvider, Map, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";

type LatLng = { lat: number; lng: number };

function LocationMap({
  currentLocation,
  customerLocation,
}: {
  currentLocation: LatLng;
  customerLocation: LatLng;
}) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string;
  const mapId = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID as string | undefined;

  const { lat: userLat, lng: userLng } = currentLocation;
  const { lat: customerLat, lng: customerLng } = customerLocation;

  return (
    <APIProvider apiKey={apiKey}>
      <Map
        className="w-full h-full"
        center={{ lat: userLat, lng: userLng }}
        defaultZoom={16}
        gestureHandling="greedy"
        disableDefaultUI
        mapId={mapId}
      >
        <AdvancedMarker position={{ lat: userLat, lng: userLng }} />
        <AdvancedMarker position={{ lat: customerLat, lng: customerLng }}>
          <Pin background={"#0f9d58"} borderColor={"#006425"} glyphColor={"#60d98f"} />
        </AdvancedMarker>
      </Map>
    </APIProvider>
  );
}

export default LocationMap;

