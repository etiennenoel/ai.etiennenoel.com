/**
 * Describes the mathematical vector space the returned embeddings belong to. Exposed on the
 * `EmbedderResult` so developers can version their local vector databases and know which
 * server-side models the vectors are compatible with.
 */
export interface EmbedderMetadataInterface {
  /**
   * Identifier of the embedding space / model that produced the vectors (e.g. `embeddinggemma-300m`).
   */
  embeddingSpace?: string;

  /**
   * Maximum number of tokens a single input can contain before it gets truncated.
   */
  maxInputTokens?: number;
}
