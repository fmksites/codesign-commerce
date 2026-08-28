import {
  PreviewBridge,
  PreviewBridgeError,
  type AssetResolver,
  DocumentWithModelContext,
  WebMcpRegistration,
  WebMcpTool,
} from "@codesign-webmcp/core";
import { toteManifest } from "./configurator";

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
        let artifacts: StudioTotePreviewArtifact[] | unknown[] = [artifact];
        if (input.proposalId !== undefined && input.proposalRevision !== undefined) {
          const bridge = new PreviewBridge(toteManifest, {
            async capturePreviews() {
              return [{
                variantId: artifact.variantId,
                surfaceId: "product-preview",
                mediaType: artifact.mediaType,
                width: artifact.width,
                height: artifact.height,
                altText: artifact.altText,
                transport: artifact.transport,
              }];
            },
          });
          const workspace = {
            configuratorId: toteManifest.id,
            manifestVersion: toteManifest.version,
            committedRevision: artifact.workspaceRevision,
            activeVariantId: artifact.variantId,
            workspaceControls: {},
            variants: [{ id: artifact.variantId, name: artifact.altText, controls: {}, elements: [] }],
          };
          const noAssets: AssetResolver<never> = { resolve: () => null };
          artifacts = await bridge.capture({
            proposalId: input.proposalId,
            proposalRevision: input.proposalRevision,
            baseRevision: artifact.workspaceRevision,
            variantIds: [artifact.variantId],
            surfaceIds: ["product-preview"],
          }, workspace, noAssets);
        }
        return {
          ok: true,
          persisted: false,
          previewStatus: "available",
          artifacts,
        } as never;
      } catch (error) {
        return {
          ok: false,
          persisted: false,
          error: {
            code: error instanceof PreviewProofError ? error.code : error instanceof PreviewBridgeError ? error.code : "PREVIEW_FAILED",
            message: "The current tote preview could not be captured and verified safely.",
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
