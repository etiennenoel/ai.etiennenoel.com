import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {RootComponent} from './components/root/root.component';
import {TranslatorApiComponent} from './pages/built-in-ai-apis/translator-api/translator-api.component';
import {PromptApiComponent} from './pages/built-in-ai-apis/prompt-api/prompt-api.component';
import {LanguageDetectorComponent} from './pages/built-in-ai-apis/language-detector/language-detector.component';
import {IndexPage} from './pages/index/index.page';
import {LayoutComponent} from './components/layout/layout.component';
import {WriterApiPage} from './pages/built-in-ai-apis/writer-api/writer-api.page';
import {SummarizerApiComponent} from './pages/built-in-ai-apis/summarizer-api/summarizer-api.component';
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
import {DownloadTesterPage} from './pages/download-tester/download-tester.page';
import {ProofreaderApiComponent} from './pages/built-in-ai-apis/proofreader-api/proofreader-api.component';
import {AutocompleteComponent} from './pages/built-in-ai-apis/autocomplete/autocomplete.component';
import {PerformanceHistoryPage} from './pages/performance/performance-history/performance-history.page';
import {PerformanceTestRunnerPage} from './pages/performance/performance-test-runner/performance-test-runner.page';
import {PerformanceTestExecutionPage} from './pages/performance/performance-test-execution-page/performance-test-execution-page';
import {PerformanceTestSeriesEnum} from '../performance-test/enums/performance-test-series.enum';
// @end

const layouts: Routes = [
  {
    path: "",
    component: IndexPage,
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
    path: "writer-api",
    component: WriterApiPage,
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
        component: PerformanceHistoryPage,
      },
      {
        path: "perf-test-runner",
        children: [
          {
            path: "",
            component: PerformanceTestRunnerPage,
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
      component: DownloadTesterPage,
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
