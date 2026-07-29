/**
 * View model used by the playground to render one row of the embeddings table.
 */
export interface EmbeddingRowInterface {
  index: number;

  input: string;

  /**
   * Number of dimensions of the returned vector.
   */
  dimensions: number;

  tokenCount?: number;

  truncated?: boolean;

  /**
   * The full vector, kept around so the similarity matrix can be computed and so the raw values
   * can be copied out of the page.
   */
  values: number[];
}
