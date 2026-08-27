import type { DocumentWithModelContext } from "@codesign-commerce/core";
import type { StudioToteAssetProofStore } from "./asset-proof";
import type { StudioToteAdapter } from "./configurator";

interface NativeInvokingModelContext {
  getTools(): Promise<Array<{ name: string }>>;
  executeTool(tool: { name: string }, input: string): Promise<unknown>;
}
interface NativeAssetProofOptions {
  document: Document & DocumentWithModelContext;
  parent: HTMLElement;
  adapter: StudioToteAdapter;
  assetStore: StudioToteAssetProofStore;
  ready: Promise<unknown>;
}

const asRecord = (value: unknown): Record<string, any> => {
  if (typeof value === "string") {
    try { return JSON.parse(value) as Record<string, any>; } catch { return { raw: value }; }
  }
  return typeof value === "object" && value !== null ? value as Record<string, any> : { raw: value };
};

const fileAsDataUrl = (file: File): Promise<string> => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.addEventListener("load", () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("The selected artwork returned no data URL.")), { once: true });
  reader.addEventListener("error", () => reject(new Error("The selected artwork could not be read.")), { once: true });
  reader.readAsDataURL(file);
});

export function mountNativeAssetProof(options: NativeAssetProofOptions): HTMLElement {
  const panel = options.document.createElement("section");
  panel.setAttribute("aria-label", "Native Chrome supplied-artwork proof");
  panel.style.cssText = "max-width:1180px;margin:0 auto 32px;padding:20px;border:2px solid #20201d;background:#fff";
  panel.innerHTML = `
    <h2 style="margin:0 0 8px">Native Chrome supplied-artwork proof</h2>
    <p>Select a real local raster image. This development-only harness converts that selected file to the bounded source passed into <code>codesign_stage_asset</code>, attaches only its opaque handle through the proposal tool and never activates Keep.</p>
    <input type="file" accept="image/png,image/jpeg,image/webp" data-native-asset-file />
    <button type="button" data-native-asset-run>Stage and propose through native WebMCP</button>
    <pre data-native-asset-result style="white-space:pre-wrap"></pre>
    <img data-native-asset-preview alt="Native WebMCP supplied-artwork tote preview" style="display:none;max-width:360px;width:100%;height:auto" />
  `;
  options.parent.append(panel);

  const input = panel.querySelector<HTMLInputElement>("[data-native-asset-file]");
  const button = panel.querySelector<HTMLButtonElement>("[data-native-asset-run]");
  const output = panel.querySelector<HTMLElement>("[data-native-asset-result]");
  const image = panel.querySelector<HTMLImageElement>("[data-native-asset-preview]");
  if (!input || !button || !output || !image) throw new Error("Native asset proof panel is incomplete");

  button.addEventListener("click", () => {
    void (async () => {
      button.disabled = true;
      output.textContent = "Transporting the selected artwork through native WebMCP…";
      panel.dataset.status = "running";
      try {
        const file = input.files?.[0];
        if (!file) throw new Error("Select one real artwork file first.");
        await options.ready;
        const modelContext = options.document.modelContext as unknown as NativeInvokingModelContext | undefined;
        if (!modelContext?.getTools || !modelContext.executeTool) throw new Error("document.modelContext invocation APIs are unavailable");
        const tools = await modelContext.getTools();
        const findTool = (name: string) => {
          const tool = tools.find((candidate) => candidate.name === name);
          if (!tool) throw new Error(`Native Chrome did not discover ${name}`);
          return tool;
        };

        const source = await fileAsDataUrl(file);
        const stage = asRecord(await modelContext.executeTool(findTool("codesign_stage_asset"), JSON.stringify({
          slotId: "print-artwork",
          source: { kind: "data-url", data: source },
          filename: file.name,
          altText: "Supplied North Form NF mark",
        })));
        if (stage.ok !== true || typeof stage.asset?.assetHandle !== "string") throw new Error(`Native asset stage failed: ${JSON.stringify(stage)}`);

        const read = asRecord(await modelContext.executeTool(findTool("codesign_read_configuration"), "{}"));
        const baseRevision = read.state?.revision;
        if (typeof baseRevision !== "string") throw new Error("Native configuration read returned no revision");
        const proposal = asRecord(await modelContext.executeTool(findTool("codesign_propose_configuration"), JSON.stringify({
          baseRevision,
          operationId: "chrome-native-supplied-artwork-proof",
          changes: [
            { designId: "tote-1", optionId: "design.name", value: "North Form supplied artwork" },
            { designId: "tote-1", optionId: "bag.color", value: "charcoal" },
            { designId: "tote-1", optionId: "print.position", value: "upper-left" },
            { designId: "tote-1", optionId: "branding.artwork_ref", value: stage.asset.assetHandle },
          ],
          assumptions: ["The selected raster file is temporary until visible page Keep."],
        })));
        if (proposal.ok !== true || typeof proposal.proposalId !== "string" || typeof proposal.proposalRevision !== "number") {
          throw new Error(`Native asset proposal failed: ${JSON.stringify(proposal)}`);
        }
        const preview = asRecord(await modelContext.executeTool(findTool("codesign_get_previews"), JSON.stringify({
          proposalId: proposal.proposalId,
          proposalRevision: proposal.proposalRevision,
          variantId: "tote-1",
        })));
        const artifact = preview.artifacts?.[0];
        if (preview.ok !== true || artifact?.transport?.kind !== "data-url" || typeof artifact.transport.value !== "string") {
          throw new Error(`Native supplied-artwork preview failed: ${JSON.stringify(preview)}`);
        }

        image.src = artifact.transport.value;
        image.style.display = "block";
        output.textContent = JSON.stringify({
          api: "document.modelContext",
          selectedFile: { name: file.name, type: file.type, bytes: file.size },
          stagedAsset: stage.asset,
          proposal: { id: proposal.proposalId, revision: proposal.proposalRevision, persisted: proposal.persisted },
          preview: {
            artifactId: artifact.artifactId,
            mediaType: artifact.mediaType,
            width: artifact.width,
            height: artifact.height,
            integrity: artifact.integrity,
            dataUrlCharacters: artifact.transport.value.length,
          },
          persistenceCounters: options.adapter.counters,
          assetCounters: options.assetStore.counters,
        }, null, 2);
        panel.dataset.status = "passed";
      } catch (error) {
        panel.dataset.status = "failed";
        output.textContent = error instanceof Error ? error.message : String(error);
      } finally {
        button.disabled = false;
      }
    })();
  });

  return panel;
}
