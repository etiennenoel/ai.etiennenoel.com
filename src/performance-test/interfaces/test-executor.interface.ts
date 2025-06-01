import {ExecutionEnum} from '../enums/execution.enum';
import {PerformanceTestSeriesEnum} from '../enums/performance-test-series.enum';
import {PerformanceTestResultModel} from '../models/performance-test-result.model';

export interface TestExecutorInterface {
  series: PerformanceTestSeriesEnum;

  init(): Promise<PerformanceTestResultModel>;
  execute(): Promise<ExecutionEnum>;
}
