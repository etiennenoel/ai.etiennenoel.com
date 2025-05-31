import {v4 as uuid} from 'uuid';
import {PerformanceTestSeriesEnum} from '../../app/enums/performance-test-series.enum';
import {InferenceExecutionResult} from '../interfaces/inference-execution-result';
import {ExecutionEnum} from '../enums/execution.enum';

export class PerformanceTestResultModel extends InferenceExecutionResult {
  id: string = uuid();
  series: PerformanceTestSeriesEnum;
  status: ExecutionEnum = ExecutionEnum.Idle;

  constructor(series: PerformanceTestSeriesEnum) {
    super();

    this.series = series;
  }
}
