import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {IndexComponent} from './pages/index/index.component';
import {RootComponent} from './components/root/root.component';
import {TranslatorApiComponent} from './pages/browser-ai/translator-api/translator-api.component';
import {
  WritingAssistanceApisComponent
} from './pages/browser-ai/writing-assistance-apis/writing-assistance-apis.component';
import {PromptApiComponent} from './pages/browser-ai/prompt-api/prompt-api.component';
import {LanguageDetectorComponent} from './pages/browser-ai/language-detector/language-detector.component';
import {BrowserAIIndexComponent} from './pages/browser-ai/index/browser-ai-index.component';

const routes: Routes = [
  {
    path: "",
    component: RootComponent,
    children: [
      {
        path: "",
        component: IndexComponent,
      },
      {
        path: "browser-ai",
        component: BrowserAIIndexComponent,
        children: [
          {
            path: "translator-api",
            component: TranslatorApiComponent
          },
          {
            path: "writing-assistance-apis",
            component: WritingAssistanceApisComponent
          },
          {
            path: "prompt-api",
            component: PromptApiComponent,
          },
          {
            path: "language-detector-api",
            component: LanguageDetectorComponent,
          }
        ]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
