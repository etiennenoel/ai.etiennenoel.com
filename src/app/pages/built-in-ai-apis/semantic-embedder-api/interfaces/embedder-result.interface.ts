import {EmbedderEmbeddingInterface} from './embedder-embedding.interface';
import {EmbedderMetadataInterface} from './embedder-metadata.interface';

/**
 * The structured object returned by `SemanticEmbedder.embed()`. A dictionary is returned rather
 * than a raw array so the API can be extended (statistics, truncation warnings, multi-modal
 * metadata) without breaking early adopters.
 */
export interface EmbedderResultInterface {
  /**
   * Corresponds strictly 1:1 with the inputs provided to `embed()`.
   */
  embeddings: EmbedderEmbeddingInterface[];

  metadata?: EmbedderMetadataInterface;
}
