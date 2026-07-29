/**
 * A single embedding, corresponding 1:1 with one of the inputs passed to `embed()`.
 */
export interface EmbedderEmbeddingInterface {
  /**
   * The raw vector representation of the input.
   */
  values: Float32Array;

  /**
   * Per-embedding statistics. Marked as "future extensibility" in the explainer, so it may be
   * absent depending on the implementation.
   */
  statistics?: {
    tokenCount?: number;
    truncated?: boolean;
  };
}
