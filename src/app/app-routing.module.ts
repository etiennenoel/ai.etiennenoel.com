import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {RootComponent} from './components/root/root.component';
import {TranslatorApiComponent} from './pages/translator-api/translator-api.component';
import {PromptApiComponent} from './pages/prompt-api/prompt-api.component';
import {LanguageDetectorComponent} from './pages/language-detector/language-detector.component';
import {IndexComponent} from './pages/index/index.component';
import {LayoutComponent} from './components/layout/layout.component';
import {WriterApiComponent} from './pages/writer-api/writer-api.component';
import {SummarizerApiComponent} from './pages/summarizer-api/summarizer-api.component';
import {RewriterApiComponent} from './pages/rewriter-api/rewriter-api.component';
import {Environment} from './environments/environment';
// @start-remove-in-chrome-dev
import {MultimodalPromptApiComponent} from './pages/multimodal-prompt-api/multimodal-prompt-api.component';
import {AudioMultimodalPromptComponent} from './pages/audio-multimodal-prompt-api/audio-multimodal-prompt.component';
import {
  TranscriptionAudioMultimodalPromptComponent
} from './pages/transcription-audio-multimodal-prompt-api/transcription-audio-multimodal-prompt.component';
import {RouteEnum} from './enums/route.enum';
import {DownloadTesterComponent} from './pages/download-tester/download-tester.component';
// @end

const layouts: Routes = [
  {
    path: "",
    component: IndexComponent,
  },
  {
    path: RouteEnum.DownloadTester,
    component: DownloadTesterComponent,
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
    component: WriterApiComponent,
  },
  {
    path: "rewriter-api",
    component: RewriterApiComponent,
  },
  {
    path: "prompt-api",
    component: PromptApiComponent,
  },
  {
    path: "language-detector-api",
    component: LanguageDetectorComponent,
  }
];

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
