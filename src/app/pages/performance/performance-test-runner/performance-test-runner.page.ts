import {Component, Inject, PLATFORM_ID, DOCUMENT} from '@angular/core';
import {PerformanceTestSeriesEnum} from '../../../../performance-test/enums/performance-test-series.enum';
import {BasePageComponent} from '../../../components/base/base-page.component';

import {ActivatedRoute, Router} from '@angular/router';
import {PerformanceResultManager} from '../../../managers/performance-result.manager';
import {Title} from '@angular/platform-browser';
import {PerformanceTestManager} from '../../../../performance-test/managers/performance-test.manager';
import {ExecutionEnum} from '../../../../performance-test/enums/execution.enum';

@Component({
  selector: 'app-performance-test-runner',
  templateUrl: './performance-test-runner.page.html',
  styleUrls: ['./performance-test-runner.page.scss'],
  standalone: false,
})
export class PerformanceTestRunnerPage extends BasePageComponent {
  protected readonly PerformanceTestSeriesEnum = PerformanceTestSeriesEnum;

  output: string = "";

  status: ExecutionEnum = ExecutionEnum.Idle;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(DOCUMENT) document: Document,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly performanceResultManager: PerformanceResultManager,
    private readonly performanceTestManager: PerformanceTestManager,
    title: Title,
  ) {
    super(document, title);
  }

  async executePerformanceTest() {
    try {
      this.status = ExecutionEnum.InProgress;
      this.output = "Test execution in progress";
      const result = await this.performanceTestManager.execute(PerformanceTestSeriesEnum.SummarizerHeadlineSmall);
      this.status = ExecutionEnum.Success;
      this.output = result.output;
    } catch (e) {
      this.status = ExecutionEnum.Error;
      this.output = e + "";
    }
  }

  protected readonly ExecutionEnum = ExecutionEnum;
}
