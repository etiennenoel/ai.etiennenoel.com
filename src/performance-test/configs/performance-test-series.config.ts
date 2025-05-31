import {PerformanceTestSeriesEnum} from '../../app/enums/performance-test-series.enum';

export const PerformanceTestSeriesConfig: {[key in PerformanceTestSeriesEnum]: {
  //numberOfExecutions: number,
  //refreshBetweenExecutions: boolean,
  creationOptions: any,
  executionOptions: any,
}} = {
  [PerformanceTestSeriesEnum.SummarizerHeadlineSmall]: {
    //numberOfExecutions: 5,
    //refreshBetweenExecutions: true,
    creationOptions: {},
    executionOptions: {},
  },
}
