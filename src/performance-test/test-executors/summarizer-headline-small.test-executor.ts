import {Injectable} from '@angular/core';
import {TestExecutorInterface} from '../interfaces/test-executor.interface';
import {PerformanceTestResultModel} from '../models/performance-test-result.model';
import {ExecutionEnum} from '../enums/execution.enum';
import {PerformanceTestSeriesConfig} from '../configs/performance-test-series.config';
import {PerformanceTestSeriesEnum} from '../../app/enums/performance-test-series.enum';

@Injectable()
export class SummarizerHeadlineSmallTestExecutor implements TestExecutorInterface {
    series = PerformanceTestSeriesEnum.SummarizerHeadlineSmall;

    async init(): Promise<PerformanceTestResultModel> {
      const seriesExecution = new PerformanceTestResultModel(this.series);

      return seriesExecution;
    }

  async execute(): Promise<ExecutionEnum> {
      // Retrieve the config
      const config = PerformanceTestSeriesConfig[this.series];

      const seriesExecution = new PerformanceTestResultModel(this.series);
      //seriesExecution.

      return ExecutionEnum.Success
    }
}
