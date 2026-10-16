import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    // jsdom provides localStorage for the persisted store.
    environment: "jsdom",
    include: ["src/**/*.test.ts"],
    restoreMocks: true,
    // Run in Venezuela's time zone (UTC-4), where the app is used, so date
    // handling is tested against a non-UTC offset.
    env: { TZ: "America/Caracas" },
  },
});
