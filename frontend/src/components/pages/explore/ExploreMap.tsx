import { useEffect, useMemo, useRef } from "react";
import L from "leaflet";
import { Link } from "react-router";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import type { DiscoverMapBbox } from "@/api/queries/fetchDiscoverClubs";
import type { IDiscoverMapCity } from "@/types/IClubs";
import "leaflet/dist/leaflet.css";

export const BRAZIL_CENTER: [number, number] = [-14.235, -51.9253];
export const BRAZIL_ZOOM = 4;
export const CITY_ZOOM = 12;

export type ExploreMapFlyTo =
  | { kind: "brazil" }
  | { kind: "point"; latitude: number; longitude: number; zoom: number }
  | {
      kind: "bounds";
      south: number;
      west: number;
      north: number;
      east: number;
    };

type ExploreMapProps = {
  mapCities: IDiscoverMapCity[];
  flyTo: ExploreMapFlyTo | null;
  onBoundsChange: (bbox: DiscoverMapBbox) => void;
};

function roundCoord(value: number) {
  return Math.round(value * 10000) / 10000;
}

function MapBoundsListener({
  onBoundsChange,
}: {
  onBoundsChange: (bbox: DiscoverMapBbox) => void;
}) {
  const map = useMap();
  const onBoundsChangeRef = useRef(onBoundsChange);
  onBoundsChangeRef.current = onBoundsChange;

  const emitBounds = () => {
    const bounds = map.getBounds();
    onBoundsChangeRef.current({
      minLat: roundCoord(bounds.getSouth()),
      maxLat: roundCoord(bounds.getNorth()),
      minLng: roundCoord(bounds.getWest()),
      maxLng: roundCoord(bounds.getEast()),
    });
  };

  useMapEvents({
    moveend: emitBounds,
  });

  useEffect(() => {
    emitBounds();
  }, [map]);

  return null;
}

function InvalidateSize() {
  const map = useMap();

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      map.invalidateSize();
    }, 100);
    return () => window.clearTimeout(timeoutId);
  }, [map]);

  return null;
}

function FlyToTarget({ target }: { target: ExploreMapFlyTo | null }) {
  const map = useMap();

  useEffect(() => {
    if (!target) {
      return;
    }
    if (target.kind === "brazil") {
      map.flyTo(BRAZIL_CENTER, BRAZIL_ZOOM);
      return;
    }
    if (target.kind === "point") {
      map.flyTo([target.latitude, target.longitude], target.zoom);
      return;
    }
    map.flyToBounds(
      [
        [target.south, target.west],
        [target.north, target.east],
      ],
      { padding: [28, 28], maxZoom: 10 },
    );
  }, [map, target]);

  return null;
}

function CityMarker({ city }: { city: IDiscoverMapCity }) {
  const icon = useMemo(
    () =>
      L.divIcon({
        className: "explore-map-marker",
        html: `<div class="explore-map-marker-pin">${city.clubs.length}</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16],
      }),
    [city.clubs.length],
  );

  return (
    <Marker position={[city.latitude, city.longitude]} icon={icon}>
      <Popup>
        <p className="mb-1 font-semibold text-foreground">{city.name}</p>
        <ul className="max-h-48 space-y-1 overflow-y-auto pr-1">
          {city.clubs.map((club) => (
            <li key={club.id}>
              <Link
                to={`/explorar/${club.id}`}
                className="text-sm text-primary underline-offset-2 hover:underline"
              >
                {club.name}
              </Link>
            </li>
          ))}
        </ul>
      </Popup>
    </Marker>
  );
}

export function ExploreMap({
  mapCities,
  flyTo,
  onBoundsChange,
}: ExploreMapProps) {
  return (
    <MapContainer
      center={BRAZIL_CENTER}
      zoom={BRAZIL_ZOOM}
      className="h-full w-full"
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapBoundsListener onBoundsChange={onBoundsChange} />
      <InvalidateSize />
      <FlyToTarget target={flyTo} />
      {mapCities.map((city) => (
        <CityMarker key={city.id} city={city} />
      ))}
    </MapContainer>
  );
}
