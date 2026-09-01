import type {
  CoDesignToolName,
  WebMcpInvocationEvent,
  WebMcpToolDisclosure,
} from "@codesign-webmcp/core";

export const TOOL_ACTIVITY_LABELS: Readonly<Record<CoDesignToolName, string>> = Object.freeze({
  codesign_read_workspace: "Inspecting current design",
  codesign_list_capabilities: "Reading available choices",
  codesign_stage_asset: "Preparing temporary artwork",
  codesign_apply_proposal: "Updating temporary proposal",
  codesign_get_previews: "Capturing current previews",
  codesign_validate_proposal: "Checking production readiness",
});

export interface AgentActivityItem extends WebMcpInvocationEvent {
  id: number;
  label: string;
}

export interface ToolDisclosureSummary {
  inspect: number;
  temporaryChange: number;
  forbiddenCommerce: 0;
  label: string;
}

export function reduceAgentActivity(
  current: readonly AgentActivityItem[],
  event: Readonly<WebMcpInvocationEvent>,
  nextId: number,
  maximum = 8,
): AgentActivityItem[] {
  const items = current.map((item) => ({ ...item }));
  if (event.phase === "start") {
    items.push({ ...event, id: nextId, label: TOOL_ACTIVITY_LABELS[event.toolName] });
  } else {
    const invocationStartedAt = event.timestamp - event.duration;
    const pending = items.find((item) => item.toolName === event.toolName
      && item.phase === "start"
      && item.timestamp === invocationStartedAt);
    if (pending) Object.assign(pending, event);
    else items.push({ ...event, id: nextId, label: TOOL_ACTIVITY_LABELS[event.toolName] });
  }
  return items.slice(-maximum);
}

export function summarizeToolDisclosures(disclosures: readonly WebMcpToolDisclosure[]): ToolDisclosureSummary {
  const inspect = disclosures.filter((tool) => tool.effect === "inspect").length;
  const temporaryChange = disclosures.filter((tool) => tool.effect === "temporary-change").length;
  return {
    inspect,
    temporaryChange,
    forbiddenCommerce: 0,
    label: `${inspect} inspect · ${temporaryChange} temporary design · 0 save/order/payment`,
  };
}
