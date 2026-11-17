import "server-only";

import { cache } from "react";

import { foodCategories, officialProducts, featuredProductIds } from "@/features/menu/data/official-snapshot";
import { drinkCategories, drinkProducts } from "@/features/menu/data/drinks-snapshot";
import { catalogSchema, type MenuRepository } from "@/features/menu/domain/catalog";

export const localMenuRepository: MenuRepository = {
  getCatalog: cache(async (kind) => catalogSchema.parse({
    kind,
    origin: kind === "food" ? "official" : "provided",
    checkedAt: "2026-11-17",
    categories: kind === "food" ? foodCategories : drinkCategories,
    products: kind === "food" ? officialProducts : drinkProducts,
    featuredIds: kind === "food" ? featuredProductIds : [],
  })),
};
