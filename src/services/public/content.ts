import "server-only";

import { cache } from "react";
import { restaurant } from "@/features/home/data/restaurant";

export const getPublicRestaurant = cache(async () => {
  return {
    ...restaurant,
    directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(restaurant.address)}`,
  };
});
