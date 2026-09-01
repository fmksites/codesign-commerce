import { describe, expect, it } from "vitest";
import type { WebMcpInvocationEvent, WebMcpToolDisclosure } from "@codesign-webmcp/core";
import { reduceAgentActivity, summarizeToolDisclosures } from "./agent-activity";

const event = (overrides: Partial<WebMcpInvocationEvent> = {}): WebMcpInvocationEvent => ({
  toolName: "codesign_read_workspace",
  phase: "start",
  effect: "inspect",
  timestamp: 1_000,
  duration: 0,
  ...overrides,
});

describe("truthful tote agent activity", () => {
  it("turns actual start and success events into one completed privacy-safe row", () => {
    const started = reduceAgentActivity([], event(), 1);
    const completed = reduceAgentActivity(started, event({ phase: "success", timestamp: 1_018, duration: 18 }), 2);

    expect(completed).toEqual([{
      id: 1,
      label: "Inspecting current design",
      toolName: "codesign_read_workspace",
      phase: "success",
      effect: "inspect",
      timestamp: 1_018,
      duration: 18,
    }]);
    expect(Object.keys(completed[0]!)).toEqual([
      "toolName", "phase", "effect", "timestamp", "duration", "id", "label",
    ]);
  });

  it("keeps a bounded timeline without arguments, results, or shopper values", () => {
    let activity = [] as ReturnType<typeof reduceAgentActivity>;
    for (let index = 0; index < 10; index += 1) {
      activity = reduceAgentActivity(activity, event({ timestamp: index }), index + 1, 4);
    }
    expect(activity).toHaveLength(4);
    expect(JSON.stringify(activity)).not.toMatch(/argument|result|artwork|customer|https?:/i);
  });

  it("correlates overlapping same-tool completions even when they finish out of order", () => {
    const first = reduceAgentActivity([], event({ timestamp: 1_000 }), 1);
    const overlapping = reduceAgentActivity(first, event({ timestamp: 1_004 }), 2);
    const secondFinishesFirst = reduceAgentActivity(
      overlapping,
      event({ phase: "success", timestamp: 1_014, duration: 10 }),
      3,
    );
    const firstFinishesLast = reduceAgentActivity(
      secondFinishesFirst,
      event({ phase: "error", timestamp: 1_025, duration: 25 }),
      3,
    );

    expect(firstFinishesLast.map(({ id, phase, duration }) => ({ id, phase, duration }))).toEqual([
      { id: 1, phase: "error", duration: 25 },
      { id: 2, phase: "success", duration: 10 },
    ]);
  });

  it("derives the 4/2/0 disclosure from registered tool metadata", () => {
    const disclosures: WebMcpToolDisclosure[] = [
      { name: "codesign_read_workspace", title: "Read", effect: "inspect" },
      { name: "codesign_list_capabilities", title: "List", effect: "inspect" },
      { name: "codesign_stage_asset", title: "Stage", effect: "temporary-change" },
      { name: "codesign_apply_proposal", title: "Apply", effect: "temporary-change" },
      { name: "codesign_get_previews", title: "Preview", effect: "inspect" },
      { name: "codesign_validate_proposal", title: "Validate", effect: "inspect" },
    ];

    expect(summarizeToolDisclosures(disclosures)).toEqual({
      inspect: 4,
      temporaryChange: 2,
      forbiddenCommerce: 0,
      label: "4 inspect · 2 temporary design · 0 save/order/payment",
    });
  });
});
