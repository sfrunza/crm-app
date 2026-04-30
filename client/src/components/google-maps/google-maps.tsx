import { ClockIcon, RouteIcon } from "@/components/icons";
import { importLibrary } from "@/lib/maps-loader";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  DESTINATION_MARKER_SVG,
  GOOGLE_MAPS_URL,
  ORIGIN_MARKER_SVG,
  WAYPOINT_MARKER_SVG,
} from "./map-config";
import type { Location } from "@/types/index";

type LatLngLiteral = {
  latitude: number;
  longitude: number;
};

type RouteLocation = {
  location: {
    latLng: LatLngLiteral;
  };
};

type ComputeRoutesRequest = {
  origin: RouteLocation;
  destination: RouteLocation;
  intermediates?: RouteLocation[];
  travelMode: "DRIVE" | "BICYCLE" | "WALK" | "TRANSIT";
  routingPreference?:
    | "TRAFFIC_UNAWARE"
    | "TRAFFIC_AWARE"
    | "TRAFFIC_AWARE_OPTIMAL";
};

const getLatLng = (location?: Location): google.maps.LatLngLiteral | null => {
  if (!location) return null;
  return { lat: location.lat, lng: location.lng };
};

interface RouteData {
  duration: string;
  distanceMeters: number;
  polyline: {
    encodedPolyline: string;
  };
}

async function computeRoutes(
  request: ComputeRoutesRequest
): Promise<RouteData | null> {
  const computeRoutesResponse = await fetch(GOOGLE_MAPS_URL, {
    method: "POST",
    body: JSON.stringify(request),
    headers: {
      "X-Goog-Api-Key": import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
      "X-Goog-FieldMask":
        "routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline",
      "Content-Type": "application/json",
    },
  });

  const computeRoutesData = await computeRoutesResponse.json();

  const route = computeRoutesData.routes[0];
  if (!route) return null;

  return route;
}

function formatDuration(seconds: number): string {
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  return `${hours}h ${remainingMins}m`;
}

function formatDistance(meters: number): string {
  const miles = meters / 1609.344;
  if (miles < 10) return `${miles.toFixed(2)} mi`;
  return `${miles.toFixed(1)} mi`;
}

function buildRouteRequest(
  origin: google.maps.LatLngLiteral,
  destination: google.maps.LatLngLiteral,
  waypoints: google.maps.LatLngLiteral[]
): ComputeRoutesRequest {
  const toLocation = (value: google.maps.LatLngLiteral): RouteLocation => ({
    location: {
      latLng: {
        latitude: value.lat,
        longitude: value.lng,
      },
    },
  });

  const request: ComputeRoutesRequest = {
    origin: toLocation(origin),
    destination: toLocation(destination),
    routingPreference: "TRAFFIC_UNAWARE",
    travelMode: "DRIVE",
  };

  if (waypoints.length) {
    request.intermediates = waypoints.map((location) => toLocation(location));
  }

  return request;
}

function createMarkerElement(svg: string): HTMLElement {
  const element = document.createElement("div");
  element.innerHTML = svg;
  return element as HTMLElement;
}

const routeCache = new Map<string, RouteData>();

function buildRouteCacheKey(
  origin: google.maps.LatLngLiteral,
  destination: google.maps.LatLngLiteral,
  waypoints: google.maps.LatLngLiteral[]
): string {
  return [
    `${origin.lat},${origin.lng}`,
    `${destination.lat},${destination.lng}`,
    ...waypoints.map((w) => `${w.lat},${w.lng}`),
  ].join("|");
}

interface GoogleMapsProps {
  origin?: Location | undefined;
  destination?: Location | undefined;
  waypoints?: Location[] | undefined;
  className?: string;
}

export function GoogleMaps({
  origin,
  destination,
  waypoints,
  className,
}: GoogleMapsProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [routeData, setRouteData] = useState<RouteData | null>(null);

  async function initMap() {
    if (!mapRef.current) return;

    const originLocation = getLatLng(origin);
    const destinationLocation = getLatLng(destination);
    const waypointLocations = waypoints
      ?.map((waypoint) => getLatLng(waypoint))
      .filter(Boolean) as google.maps.LatLngLiteral[];

    try {
      const { Map } = await importLibrary("maps");

      const { AdvancedMarkerElement } = await importLibrary("marker");

      const map = new Map(mapRef.current, {
        center: originLocation ?? destinationLocation,
        zoom: 12,
        mapId: "c73a52666680c96bc98dc838",
        disableDefaultUI: true,
        gestureHandling: "none",
        zoomControl: false,
        draggable: false,
      });

      //////////////////////////////////////////////////////////////
      // Compute Routes
      //////////////////////////////////////////////////////////////

      if (originLocation && destinationLocation) {
        const cacheKey = buildRouteCacheKey(
          originLocation,
          destinationLocation,
          waypointLocations
        );
        let route = routeCache.get(cacheKey) ?? null;

        if (!route) {
          const routeRequest = buildRouteRequest(
            originLocation,
            destinationLocation,
            waypointLocations
          );
          route = await computeRoutes(routeRequest);
          if (route) routeCache.set(cacheKey, route);
        }

        if (!route) return;

        setRouteData(route);

        const path = google.maps.geometry.encoding.decodePath(
          route.polyline.encodedPolyline
        );

        new google.maps.Polyline({
          map,
          path,
          strokeColor: "#470efa",
          strokeWeight: 6,
        });

        const bounds = new google.maps.LatLngBounds();
        path.forEach((p) => bounds.extend(p));
        map.fitBounds(bounds);

        //////////////////////////////////////////////////////////////
        // Add Markers for origin, destination, and waypoints
        //////////////////////////////////////////////////////////////

        if (originLocation) {
          new AdvancedMarkerElement({
            map,
            position: originLocation,
            content: createMarkerElement(ORIGIN_MARKER_SVG),
          });
        }

        if (destinationLocation) {
          new AdvancedMarkerElement({
            map,
            position: destinationLocation,
            content: createMarkerElement(DESTINATION_MARKER_SVG),
          });
        }

        if (waypointLocations.length) {
          waypointLocations.forEach((location) => {
            new AdvancedMarkerElement({
              map,
              position: location,
              content: createMarkerElement(WAYPOINT_MARKER_SVG),
            });
          });
        }
        return;
      }

      //////////////////////////////////////////////////////////////
      // Add Marker for single location
      //////////////////////////////////////////////////////////////

      const singleLocation = originLocation ?? destinationLocation;
      if (singleLocation) {
        new AdvancedMarkerElement({
          map,
          position: singleLocation,
          content: createMarkerElement(ORIGIN_MARKER_SVG),
        });
        map.setCenter(singleLocation);
        map.setZoom(14);
      }
    } catch (error) {
      console.error("Failed to initialize Google Maps", error);
    } finally {
      setIsLoading(false);
    }
  }

  //Initialize Map
  useEffect(() => {
    initMap();
  }, [origin, destination, waypoints]);

  return (
    <div className={cn("relative h-full w-full", className)}>
      <div ref={mapRef} className="h-full w-full" />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50">
          <Spinner className="size-5" />
        </div>
      )}
      {routeData && (
        <div className="absolute top-1 right-1 flex flex-col gap-2">
          <Button
            variant="outline"
            size="xs"
            className="justify-start gap-3 bg-background/50 hover:bg-background/50"
          >
            <div className="flex items-center gap-1.5">
              <ClockIcon className="size-3.5" />
              <span className="font-medium">
                {formatDuration(Number(routeData.duration.replace("s", "")))}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs opacity-80">
              <RouteIcon className="size-3" />
              {formatDistance(routeData.distanceMeters)}
            </div>
          </Button>
        </div>
      )}
    </div>
  );
}
