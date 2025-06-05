import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {RootComponent} from './components/root/root.component';
import {TranslatorApiComponent} from './pages/built-in-ai-apis/translator-api/translator-api.component';
import {PromptApiComponent} from './pages/built-in-ai-apis/prompt-api/prompt-api.component';
import {LanguageDetectorComponent} from './pages/built-in-ai-apis/language-detector/language-detector.component';
import {IndexComponent} from './pages/index/index.component';
import {LayoutComponent} from './components/layout/layout.component';
import {WriterApiComponent} from './pages/built-in-ai-apis/writer-api/writer-api.component';
import {SummarizerApiComponent} from './pages/built-in-ai-apis/summarizer-api/summarizer-api.component';
import {
  SummarizerBatchApiComponent
} from './pages/built-in-ai-apis/summarizer-batch-api/summarizer-batch-api.component';
import {RewriterApiComponent} from './pages/built-in-ai-apis/rewriter-api/rewriter-api.component';
import {Environment} from './environments/environment';
// @start-remove-in-chrome-dev
import {MultimodalPromptApiComponent} from './pages/built-in-ai-apis/multimodal-prompt-api/multimodal-prompt-api.component';
import {AudioMultimodalPromptComponent} from './pages/built-in-ai-apis/audio-multimodal-prompt-api/audio-multimodal-prompt.component';
import {
  TranscriptionAudioMultimodalPromptComponent
} from './pages/built-in-ai-apis/transcription-audio-multimodal-prompt-api/transcription-audio-multimodal-prompt.component';
import {EnvironmentNameEnum} from './enums/environment-name.enum';
import {RouteEnum} from './enums/route.enum';
import {DownloadTesterComponent} from './pages/download-tester/download-tester.component';
import {ProofreaderApiComponent} from './pages/built-in-ai-apis/proofreader-api/proofreader-api.component';
import {AutocompleteComponent} from './pages/built-in-ai-apis/autocomplete/autocomplete.component';
import {PerformanceHistoryComponent} from './pages/performance/performance-history/performance-history.component';
import {PerformanceTestRunnerPageComponent} from './pages/performance/performance-test-runner/performance-test-runner.component';
import {PerformanceTestExecutionPage} from './pages/performance/performance-test-execution-page/performance-test-execution-page';
import {PerformanceTestSeriesEnum} from '../performance-test/enums/performance-test-series.enum';
// @end

const layouts: Routes = [
  {
    path: "",
    component: IndexComponent,
  },
  {
    path: "translator-api",
    component: TranslatorApiComponent
  },
  {
    path: "summarizer-api",
    component: SummarizerApiComponent,
  },
  {
    path: "summarizer-batch-api",
    component: SummarizerBatchApiComponent,
  },
  {
    path: "writer-api",
    component: WriterApiComponent,
  },
  {
    path: "rewriter-api",
    component: RewriterApiComponent,
  },
  {
    path: "proofreader-api",
    component: ProofreaderApiComponent,
  },
  {
    path: "autocomplete",
    component: AutocompleteComponent,
  },
  {
    path: "prompt-api",
    component: PromptApiComponent,
  },
  {
    path: "language-detector-api",
    component: LanguageDetectorComponent,
  },
  {
    path: "performance",
    children: [
      {
        path: "history",
        component: PerformanceHistoryComponent,
      },
      {
        path: "perf-test-runner",
        children: [
          {
            path: "",
            component: PerformanceTestRunnerPageComponent,
          },
          {
            path: ":testSeries",
            component: PerformanceTestExecutionPage,
          }
        ],

      }
    ]
  }
];

if(Environment.name !== EnvironmentNameEnum.ChromeDev) {
  layouts.push(
  {
    path: RouteEnum.DownloadTester,
      component: DownloadTesterComponent,
  });
}

// @start-remove-in-chrome-dev
if (Environment.multimodal) {
  // Append Routes based on the environment
  layouts.push({
    path: "multimodal-prompt-api",
    component: MultimodalPromptApiComponent,
  });
  layouts.push({
    path: "audio-multimodal-prompt-api",
    component: AudioMultimodalPromptComponent,
  });
  layouts.push({
    path: "transcription-audio-multimodal-prompt-api",
    component: TranscriptionAudioMultimodalPromptComponent,
  });
}
// @end

const routes: Routes = [
    {
      path: "",
      component: RootComponent,
      children: [
        {
          path: "",
          component: LayoutComponent,
          children: layouts,
        }
      ]
    },
  ]
;


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
