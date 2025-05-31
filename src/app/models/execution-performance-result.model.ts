import {BuiltInAiApiEnum} from '../enums/built-in-ai-api.enum';
import {InferenceExecutionResult} from '../../performance-test/interfaces/inference-execution-result';

export class ExecutionPerformanceResultModel extends InferenceExecutionResult {
  createdAt = new Date();

  api: BuiltInAiApiEnum;

  creationOptions?: any

  executionOptions?: any;

  constructor(api: BuiltInAiApiEnum) {
    super();

    this.api = api;
  }

  /**
   * This returns either the input or prompt value depending on the API called.
   */
  getInput(): string {
    return this.executionOptions?.input || this.executionOptions?.prompt;
  }
}
