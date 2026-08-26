import type {
  CommitMetadata,
  CommitResult,
  ConfigurationState,
  ConfiguratorAdapter,
  OptionRequest,
  OptionResult,
  ValidationResult,
} from "./types.js";

export interface InMemoryAdapterSnapshot {
  committed: ConfigurationState;
}

export interface InMemoryAdapterCounters {
  quiesceCalls: number;
  previewCalls: number;
  restoreCalls: number;
  localWrites: number;
  serverWrites: number;
  commitCalls: number;
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

export class InMemoryConfiguratorAdapter implements ConfiguratorAdapter<InMemoryAdapterSnapshot> {
  #committed: ConfigurationState;
  #visible: ConfigurationState;
  #listeners = new Set<(revision: string) => void>();
  #revisionNumber = 1;
  #commits = new Map<string, { revision: string; serverPersisted: boolean }>();

  readonly counters: InMemoryAdapterCounters = {
    quiesceCalls: 0,
    previewCalls: 0,
    restoreCalls: 0,
    localWrites: 0,
    serverWrites: 0,
    commitCalls: 0,
  };

  failServerSave = false;
  throwDuringCommit = false;

  constructor(initialState: ConfigurationState) {
    this.#committed = clone(initialState);
    this.#visible = clone(initialState);
  }

  get visibleState(): ConfigurationState {
    return clone(this.#visible);
  }

  get committedState(): ConfigurationState {
    return clone(this.#committed);
  }

  async readState(): Promise<ConfigurationState> {
    return clone(this.#committed);
  }

  async listOptions(_request: OptionRequest): Promise<OptionResult> {
    return { revision: this.#committed.revision, options: [] };
  }

  async quiescePersistence(): Promise<void> {
    this.counters.quiesceCalls += 1;
  }

  async captureSnapshot(): Promise<InMemoryAdapterSnapshot> {
    return { committed: clone(this.#committed) };
  }

  async previewState(state: ConfigurationState): Promise<void> {
    this.counters.previewCalls += 1;
    this.#visible = clone(state);
  }

  async validateState(state: ConfigurationState): Promise<ValidationResult> {
    const sum = state.designs.reduce((total, design) => total + design.quantity, 0);
    const issues = sum === state.order.totalQuantity
      ? []
      : [{
          code: "QUANTITY_TOTAL_MISMATCH",
          severity: "constraint-error" as const,
          message: "Design quantities must equal the order total",
          optionIds: ["order.total_quantity", "design.quantity"],
        }];
    return {
      configurationValid: issues.length === 0,
      productionReady: issues.length === 0 && state.designs.every((design) => design.assets.every((asset) => asset.status === "ready")),
      issues,
      assumptions: [],
    };
  }

  async restoreSnapshot(snapshot: InMemoryAdapterSnapshot): Promise<void> {
    this.counters.restoreCalls += 1;
    this.#visible = clone(snapshot.committed);
  }

  async commitState(state: ConfigurationState, metadata: CommitMetadata): Promise<CommitResult> {
    this.counters.commitCalls += 1;
    if (this.throwDuringCommit) throw new Error("Synthetic unknown commit failure");
    let commit = this.#commits.get(metadata.proposalId);
    if (!commit) {
      this.counters.localWrites += 1;
      this.#revisionNumber += 1;
      commit = { revision: `revision-${this.#revisionNumber}`, serverPersisted: false };
      this.#commits.set(metadata.proposalId, commit);
      this.#committed = { ...clone(state), revision: commit.revision };
      this.#visible = clone(this.#committed);
      for (const listener of this.#listeners) listener(commit.revision);
    }
    if (this.failServerSave) {
      return {
        revision: commit.revision,
        localPersisted: true,
        serverPersisted: false,
        errorCode: "SYNTHETIC_SERVER_SAVE_FAILED",
      };
    }
    if (!commit.serverPersisted) {
      this.counters.serverWrites += 1;
      commit.serverPersisted = true;
    }
    return { revision: commit.revision, localPersisted: true, serverPersisted: true };
  }

  subscribeToExternalChanges(listener: (revision: string) => void): () => void {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  }

  simulateExternalRevision(revision: string): void {
    this.#committed = { ...this.#committed, revision };
    for (const listener of this.#listeners) listener(revision);
  }
}
