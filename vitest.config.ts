import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "server-only": fileURLToPath(new URL("./tests/unit/server-only.ts", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.ts"],
    env: { NEXT_PUBLIC_SITE_URL: "http://localhost:3000" },
    clearMocks: true,
    coverage: {
      provider: "v8",
      include: [
        "src/config/*.ts",
        "src/features/menu/domain/*.ts",
        "src/features/menu/data/get-catalog.ts",
        "src/lib/seo/*.ts",
        "src/services/public/content.ts",
      ],
      reporter: ["text", "html"],
    },
  },
});
