/**
 * Optional hint passed to `SemanticEmbedder.embed()` to let the underlying model optimize the
 * embedding for a specific downstream task.
 *
 * The explainer only names `retrieval` and `classification` explicitly and states that the hint is
 * strictly optional: a browser is allowed to ignore it entirely if its model doesn't support task
 * types.
 *
 * @see https://github.com/explainers-by-googlers/semantic-embedder-api#task-type-optimization-hints
 */
export enum SemanticEmbedderTaskTypeEnum {
  Retrieval = 'retrieval',
  Classification = 'classification',
}
