// @vitest-environment happy-dom

import { describe, expect, it } from "vitest";
import { syncRangeControl } from "./range-controls";

describe("studio tote range controls", () => {
  it("keeps exact hundredth scale proposals synchronized with the accessible native control", () => {
    const control = document.createElement("input");
    control.type = "range";
    control.min = "0.5";
    control.max = "1.4";

    syncRangeControl(control, "branding.scale", 0.82);

    expect(control.step).toBe("0.01");
    expect(control.value).toBe("0.82");
    expect(control.getAttribute("aria-label")).toBe("Artwork scale");
    expect(control.getAttribute("aria-valuenow")).toBe("0.82");
    expect(control.getAttribute("aria-valuetext")).toBe("82 percent");
  });

  it("describes negative rotation proposals without changing their exact value", () => {
    const control = document.createElement("input");
    control.type = "range";
    control.min = "-30";
    control.max = "30";

    syncRangeControl(control, "branding.rotation", -6);

    expect(control.step).toBe("1");
    expect(control.value).toBe("-6");
    expect(control.getAttribute("aria-valuetext")).toBe("-6 degrees");
  });
});
