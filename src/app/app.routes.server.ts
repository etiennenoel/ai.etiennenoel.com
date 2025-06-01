import {RenderMode, ServerRoute} from '@angular/ssr';
import {PerformanceTestSeriesEnum} from '../performance-test/enums/performance-test-series.enum';

export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Prerender
  },
  {
    path: "performance/perf-test-runner/:testSeries",
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => {
      return [{testSeries: PerformanceTestSeriesEnum.SummarizerHeadlineSmall}]
    }
  }
];
