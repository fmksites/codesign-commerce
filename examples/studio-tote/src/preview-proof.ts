import type {
  DocumentWithModelContext,
  WebMcpRegistration,
  WebMcpTool,
} from "@codesign-commerce/core";

export interface StudioTotePreviewArtifact {
  artifactId: string;
  proposalId: string | null;
  proposalRevision: number | null;
  workspaceRevision: string;
  variantId: string;
  mediaType: "image/webp";
  width: number;
  height: number;
  altText: string;
  integrity: string;
  transport: {
    kind: "data-url";
    value: string;
  };
}

export interface StudioTotePreviewRequest {
  proposalId?: string;
  proposalRevision?: number;
  variantId?: string;
}

export interface StudioTotePreviewProofDependencies {
  capture(request: StudioTotePreviewRequest): Promise<StudioTotePreviewArtifact>;
}

const INPUT_SCHEMA = {
  type: "object",
  properties: {
    proposalId: { type: "string", minLength: 1, maxLength: 200 },
    proposalRevision: { type: "integer", minimum: 1 },
    variantId: { type: "string", minLength: 1, maxLength: 128 },
  },
  additionalProperties: false,
} as const;

function isRequest(value: unknown): value is StudioTotePreviewRequest {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const input = value as Record<string, unknown>;
  if (!Object.keys(input).every((key) => ["proposalId", "proposalRevision", "variantId"].includes(key))) return false;
  if (input.proposalId !== undefined && (typeof input.proposalId !== "string" || input.proposalId.length < 1 || input.proposalId.length > 200)) return false;
  if (input.proposalRevision !== undefined && (!Number.isInteger(input.proposalRevision) || (input.proposalRevision as number) < 1)) return false;
  if (input.variantId !== undefined && (typeof input.variantId !== "string" || input.variantId.length < 1 || input.variantId.length > 128)) return false;
  return true;
}

export function createStudioTotePreviewProofTool(
  dependencies: StudioTotePreviewProofDependencies,
): WebMcpTool<StudioTotePreviewRequest> {
  return {
    name: "codesign_get_previews",
    title: "Get the current tote preview",
    description: "Capture the real visible Studio Tote renderer as a bounded WebP image for the current committed design or exact temporary proposal revision. Use this after a coherent proposal or refinement. The tool is read-only and never saves anything.",
    inputSchema: INPUT_SCHEMA,
    annotations: { readOnlyHint: true, untrustedContentHint: true },
    async execute(input) {
      if (!isRequest(input)) {
        return {
          ok: false,
          persisted: false,
          error: {
            code: "INVALID_INPUT",
            message: "The preview request did not match the bounded proof schema.",
            retryable: false,
          },
        } as never;
      }

      try {
        const artifact = await dependencies.capture(input);
        return {
          ok: true,
          persisted: false,
          previewStatus: "available",
          artifacts: [artifact],
        } as never;
      } catch (error) {
        return {
          ok: false,
          persisted: false,
          error: {
            code: error instanceof PreviewProofError ? error.code : "PREVIEW_FAILED",
            message: error instanceof Error ? error.message : "The tote preview could not be captured.",
            retryable: true,
          },
        } as never;
      }
    },
  };
}

export class PreviewProofError extends Error {
  constructor(
    readonly code: "PREVIEW_STALE" | "UNKNOWN_TARGET" | "PREVIEW_FAILED",
    message: string,
  ) {
    super(message);
    this.name = "PreviewProofError";
  }
}

export function registerStudioTotePreviewProof(
  document: DocumentWithModelContext,
  dependencies: StudioTotePreviewProofDependencies,
): WebMcpRegistration {
  const controller = new AbortController();
  const tool = createStudioTotePreviewProofTool(dependencies);
  if (!document.modelContext?.registerTool) {
    return {
      supported: false,
      toolNames: [],
      unregister: () => controller.abort(),
      ready: Promise.resolve(),
    };
  }

  const ready = Promise.resolve(
    document.modelContext.registerTool(tool, { signal: controller.signal }),
  ).then(() => undefined);
  return {
    supported: true,
    toolNames: [tool.name],
    unregister: () => controller.abort(),
    ready,
  };
}
