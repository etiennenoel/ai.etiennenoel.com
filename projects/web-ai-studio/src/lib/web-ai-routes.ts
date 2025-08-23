import {Routes} from '@angular/router';
import {LayoutComponent} from './components/layout/layout.component';
import {ChatPage} from './pages/chat/chat.page';
import {TranslationPage} from './pages/translation/translation.page';

export const WebAiRoutes: Routes = [
  {
    path: "",
    component: LayoutComponent,
    children: [
      {
        path: "",
        component: ChatPage,
      },
      {
        path: "translation",
        component: TranslationPage,
      }
    ]
  }
]
