import { Button } from "@/components/ui/button";

function openGoogleDirections(
  origin: string | undefined,
  destination: string | undefined,
  stops: string[] | undefined,
) {
  if (!origin || !destination) return;

  const params = new URLSearchParams({
    api: "1",
    origin,
    destination,
    travelmode: "driving",
  });

  let waypoints: string[] = [];

  if (stops) {
    stops.forEach((stop) => {
      waypoints.push(stop);
    });
  }

  if (waypoints.length > 0) {
    params.append("waypoints", waypoints.join("|"));
  }

  const url = `https://www.google.com/maps/dir/?${params.toString()}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

export function OpenGoogleMapsButton({
  origin,
  destination,
  stops,
  ...props
}: React.ComponentProps<typeof Button> & {
  origin?: string;
  destination?: string;
  stops?: string[];
}) {
  return (
    <Button
      variant="outline"
      className="rounded-full text-green-600 shadow-md hover:text-green-600"
      onClick={() => {
        if (!origin || !destination) return;
        openGoogleDirections(origin, destination, stops);
      }}
      {...props}
    />
  );
}
