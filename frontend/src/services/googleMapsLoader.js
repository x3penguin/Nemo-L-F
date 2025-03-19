import { Loader } from '@googlemaps/js-api-loader';

// Create a singleton instance
let loaderInstance = null;

export const getLoader = (apiKey) => {
  if (!loaderInstance) {
    loaderInstance = new Loader({
      apiKey: apiKey,
      version: "weekly",
      libraries: ["places"],
      id: "__googleMapsScriptId" // This prevents multiple script loads
    });
  }
  return loaderInstance;
};
