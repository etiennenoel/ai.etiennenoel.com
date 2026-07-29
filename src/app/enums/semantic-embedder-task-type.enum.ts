/**
 * Optional hint passed to `SemanticEmbedder.embed()` to let the underlying model optimize the
 * embedding for a specific downstream task.
 *
 * The hint is strictly optional: a browser is allowed to ignore it entirely if its model doesn't
 * support task types.
 *
 * Retrieval is split in two: embed the query with `RetrievalQuery` and the passages it is matched
 * against with `RetrievalDocument`. Using the same value on both sides is a common mistake and
 * degrades the quality of the match.
 *
 * @see https://github.com/explainers-by-googlers/semantic-embedder-api#task-type-optimization-hints
 */
export enum SemanticEmbedderTaskTypeEnum {
  SemanticSimilarity = 'semantic-similarity',
  RetrievalQuery = 'retrieval-query',
  RetrievalDocument = 'retrieval-document',
  Classification = 'classification',
  Clustering = 'clustering',
}
