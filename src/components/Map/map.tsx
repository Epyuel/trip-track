import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from "react-leaflet";
import { useRouteStore } from "../../hooks/useRouteStore";

export default function Map() {
  const { coordinates, mandatoryStops, routeData, fetchRoute } = useRouteStore();
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (coordinates.length > 1 && userPosition) {
      fetchRoute([userPosition, ...coordinates]);
    }
  }, [coordinates, fetchRoute, userPosition]);

  // Get the user's current position
  useEffect(() => {
    if (typeof window !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserPosition([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error("Error fetching user position:", error);
        }
      );
    }
  }, []);

  // Combine user position, coordinates, and mandatory stops into a single array for the polyline
  const pathCoordinates = [
    ...(userPosition ? [userPosition] : []),
    ...coordinates.slice(0, 1),
    ...mandatoryStops.map((stop) => stop.location),
    ...coordinates.slice(1),
  ];

  const ChangeCenter = ({ position }:{position:[number,number]}) => {
    const map = useMap();
    map.setView(position, map.getZoom()); // Updates the map center
    return null;
  };

  return (
    <MapContainer
      center={userPosition!=null? userPosition: (coordinates.length > 0 ? coordinates[0] : [37.7749, -122.4194])}
      zoom={8}
      className="h-full w-full"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />

      {/* Route Path */}
      {routeData?.routes?.[0]?.geometry && (
        <Polyline
          positions={decodePolyline(routeData.routes[0].geometry)}
          color="blue"
          weight={5}
        />
      )}

      {/* User's Current Position */}
      {userPosition && (
        <Marker position={userPosition} icon={startIcon}>
          <Popup>Your Current Position (Start)</Popup>
        </Marker>
      )}

      {/* Start Marker */}
      {coordinates.length > 0 && (
        <Marker position={coordinates[0]} icon={startIcon}>
          <Popup>Start Position</Popup>
        </Marker>
      )}

      {/* Mandatory Stops with Informative Data */}
      {mandatoryStops.map((stop, index) => (
        <Marker key={`mandatory-${index}`} position={stop.location} icon={mandatoryStopIcon}>
          <Popup>
            <div className="text-sm">
              <strong>Fuel Stop {index + 1}</strong><br />
              ⛽ Station: {stop.name}<br />
              💲 Cost: ${stop.estimatedCost}<br />
              ⏳ Stop Time: {stop.stopDuration} mins
            </div>
          </Popup>
        </Marker>
      ))}

      {/* End Marker */}
      {coordinates.length > 1 && (
        <Marker position={coordinates[coordinates.length - 1]} icon={endIcon}>
          <Popup>End Position</Popup>
        </Marker>
      )}

      {/* Polyline connecting all points */}
      <Polyline
        positions={pathCoordinates}
        color="red"
        weight={3}
        dashArray="5, 10"
      />

      <ChangeCenter position={userPosition!=null? userPosition: (coordinates.length > 0 ? coordinates[0] : [37.7749, -122.4194])}/>
    </MapContainer>
  );
}

// Function to decode polyline (since OpenRouteService returns encoded geometry)
function decodePolyline(encoded: string) {
  const points: [number, number][] = [];
  let index = 0,
    lat = 0,
    lng = 0;

  while (index < encoded.length) {
    let shift = 0,
      result = 0,
      byte;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    lat += result & 1 ? ~(result >> 1) : result >> 1;

    shift = 0;
    result = 0;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    lng += result & 1 ? ~(result >> 1) : result >> 1;

    points.push([lat * 1e-5, lng * 1e-5]);
  }
  return points;
}

// Define custom icons for different markers
const startIcon = new L.Icon({
  iconUrl: "mapred.svg",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const endIcon = new L.Icon({
  iconUrl: "mapgreen.svg",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const mandatoryStopIcon = new L.Icon({
  iconUrl: "gas-station-svgrepo-com.svg",
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});