import { describe, expect, it } from "vitest";
import { getPublicRestaurant } from "@/services/public/content";
import { locales } from "@/i18n/config";

describe("contenido público local", () => {
  it("conserva el contacto verificado y los horarios de los seis idiomas", async () => {
    const restaurant = await getPublicRestaurant();
    expect(restaurant.mobile.href).toBe("tel:+34615279494");
    expect(restaurant.landline.href).toBe("tel:+34952654872");
    expect(restaurant.address).toContain("Sánchez Pastor, 10");
    for (const locale of locales) expect(restaurant.hours[locale]).toContain("12:00–00:00");
    expect(new URL(restaurant.directionsUrl).searchParams.get("destination")).toBe(restaurant.address);
  });
});
