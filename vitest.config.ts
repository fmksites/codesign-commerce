import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@codesign-webmcp/core": fileURLToPath(
        new URL("./packages/codesign-webmcp/src/index.ts", import.meta.url),
      ),
    },
  },
  test: {
    include: ["**/*.test.ts"],
  },
});
