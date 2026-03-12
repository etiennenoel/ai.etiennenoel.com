import {Routes} from '@angular/router';
import {LayoutComponent} from './components/layout/layout.component';
import {TranslationPage} from './pages/translation/translation.page';
import {RouteEnum} from './enums/route.enum';

export const WebAiRoutes: Routes = [
  {
    path: "",
    component: LayoutComponent,
    children: [
      {
        path: "translation",
        component: TranslationPage,
        data: {
          route: RouteEnum.Translation
        }
      }
    ]
  }
]
