import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {RootComponent} from './components/root/root.component';
import {TranslatorApiComponent} from './pages/translator-api/translator-api.component';
import {
  WritingAssistanceApisComponent
} from './pages/writing-assistance-apis/writing-assistance-apis.component';
import {PromptApiComponent} from './pages/prompt-api/prompt-api.component';
import {LanguageDetectorComponent} from './pages/language-detector/language-detector.component';
import {IndexComponent} from './pages/index/index.component';
import {LayoutComponent} from './components/layout/layout.component';
import {WriterApiComponent} from './pages/writer-api/writer-api.component';

const routes: Routes = [
    {
      path: "",
      component: RootComponent,
      children: [
        {
          path: "",
          component: LayoutComponent,
          children: [
            {
              path: "",
              component: IndexComponent,
            },
            {
              path: "translator-api",
              component: TranslatorApiComponent
            },
            {
              path: "writer-api",
              component: WriterApiComponent,
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
    },
  ]
;

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
