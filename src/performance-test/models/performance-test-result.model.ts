import {v4 as uuid} from 'uuid';
import {PerformanceTestSeriesEnum} from '../../app/enums/performance-test-series.enum';
import {ExecutionPerformanceResultBase} from '../interfaces/execution-performance-result.base';
import {ExecutionEnum} from '../enums/execution.enum';

export class PerformanceTestResultModel extends ExecutionPerformanceResultBase {
  id: string = uuid();
  series: PerformanceTestSeriesEnum;
  status: ExecutionEnum = ExecutionEnum.Idle;

  constructor(series: PerformanceTestSeriesEnum) {
    super();

    this.series = series;
  }
}
