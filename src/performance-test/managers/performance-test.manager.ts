import {Injectable} from '@angular/core';
import {PerformanceTestResultModel} from '../models/performance-test-result.model';
import {PerformanceTestSeriesEnum} from '../../app/enums/performance-test-series.enum';
import {TestExecutorInterface} from '../interfaces/test-executor.interface';
import {SummarizerHeadlineSmallTestExecutor} from '../test-executors/summarizer-headline-small.test-executor';
import {ExecutionEnum} from '../enums/execution.enum';

@Injectable({
  providedIn: "root"
})
export class PerformanceTestManager {

  constructor(
    private readonly summarizerHeadlineSmallTestExecutor: SummarizerHeadlineSmallTestExecutor,
  ) {
  }

  getTestExecutor(series: PerformanceTestSeriesEnum): TestExecutorInterface {
    switch (series) {
      case PerformanceTestSeriesEnum.SummarizerHeadlineSmall:
        return this.summarizerHeadlineSmallTestExecutor;
    }
  }

  async execute(series: PerformanceTestSeriesEnum): Promise<void> {

    const executor = this.getTestExecutor(series);

    const performanceTestResult = await executor.init();

    // todo: Start the observer that will be tracking the performance.

    const status = await executor.execute()
    performanceTestResult.status = status;

    // todo: Save the PerformanceTestResult to IndexedDB.

  }
}
