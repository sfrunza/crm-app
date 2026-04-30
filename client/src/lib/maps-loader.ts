import { setOptions, importLibrary } from "@googlemaps/js-api-loader";

setOptions({
  key: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  v: "beta",
  libraries: ["places", "marker", "geometry"],
  language: "en-US",
  region: "us",
});

export { importLibrary };
