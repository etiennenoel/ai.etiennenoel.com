import {BuiltInAiApiEnum} from '../enums/built-in-ai-api.enum';
import {ExecutionPerformanceResultBase} from '../../performance-test/interfaces/execution-performance-result.base';

export class ExecutionPerformanceResultModel extends ExecutionPerformanceResultBase {
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
