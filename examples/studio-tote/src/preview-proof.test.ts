import { describe, expect, it, vi } from "vitest";
import {
  createStudioTotePreviewProofTool,
  registerStudioTotePreviewProof,
  type StudioTotePreviewArtifact,
} from "./preview-proof";

const artifact: StudioTotePreviewArtifact = {
  artifactId: "preview-proposal-2-tote-1",
  proposalId: "proposal-2",
  proposalRevision: 2,
  workspaceRevision: "tote-revision-1",
  variantId: "tote-1",
  mediaType: "image/webp",
  width: 640,
  height: 640,
  altText: "Natural canvas studio tote with long handles",
  integrity: "sha256:preview-proof",
  transport: { kind: "data-url", value: "data:image/webp;base64,cHJldmlldw==" },
};

describe("studio tote preview feasibility proof", () => {
  it("returns one revision-bound renderer artifact without persistence", async () => {
    const capture = vi.fn().mockResolvedValue(artifact);
    const tool = createStudioTotePreviewProofTool({ capture });

    await expect(tool.execute({
      proposalId: "proposal-2",
      proposalRevision: 2,
      variantId: "tote-1",
    }, {})).resolves.toEqual({
      ok: true,
      persisted: false,
      previewStatus: "available",
      artifacts: [artifact],
    });
    expect(capture).toHaveBeenCalledWith({
      proposalId: "proposal-2",
      proposalRevision: 2,
      variantId: "tote-1",
    });
  });

  it("rejects additional and malformed input before capture", async () => {
    const capture = vi.fn().mockResolvedValue(artifact);
    const tool = createStudioTotePreviewProofTool({ capture });

    await expect(tool.execute({ extra: true } as never, {})).resolves.toMatchObject({
      ok: false,
      persisted: false,
      error: { code: "INVALID_INPUT", retryable: false },
    });
    expect(capture).not.toHaveBeenCalled();
  });

  it("progressively enhances only documents with WebMCP", async () => {
    const capture = vi.fn().mockResolvedValue(artifact);
    expect(registerStudioTotePreviewProof({}, { capture })).toMatchObject({
      supported: false,
      toolNames: [],
    });

    const registerTool = vi.fn();
    const registration = registerStudioTotePreviewProof({ modelContext: { registerTool } }, { capture });
    await registration.ready;
    expect(registration).toMatchObject({ supported: true, toolNames: ["codesign_get_previews"] });
    expect(registerTool).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "codesign_get_previews",
        annotations: { readOnlyHint: true, untrustedContentHint: true },
        inputSchema: expect.objectContaining({ additionalProperties: false }),
      }),
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });
});
