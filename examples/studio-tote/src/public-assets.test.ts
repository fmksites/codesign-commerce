import { describe, expect, it } from "vitest";
import { resolveStudioToteAsset } from "./public-assets";

describe("resolveStudioToteAsset", () => {
  it("keeps the standalone Vite asset path when no merchant override exists", () => {
    expect(resolveStudioToteAsset("tote-natural-long.png", "./")).toBe("./tote-natural-long.png");
  });

  it("uses a merchant-provided CDN URL when the configurator is embedded", () => {
    expect(resolveStudioToteAsset("tote-natural-long.png", "./", {
      "tote-natural-long.png": "https://cdn.shopify.com/s/files/example/codesign-tote-natural-long.png",
    })).toBe("https://cdn.shopify.com/s/files/example/codesign-tote-natural-long.png");
  });
});
