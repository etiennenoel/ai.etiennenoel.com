import { NgModule } from '@angular/core';
import {ChatPage} from './pages/chat/chat.page';
import {BrowserModule} from '@angular/platform-browser';
import {AppRoutingModule} from '../../../../src/app/app-routing.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {MagienoDragAndDropComponent} from '@magieno/angular-drag-and-drop';
import {MagienoBootstrapDropdownComponent} from '@magieno/angular-bootstrap-dropdown';
import {MagienoCodeEditorModule} from '@magieno/angular-code-editor';
import {MagienoCoreModule} from '@magieno/angular-core';
import {MagienoMediaModule} from '@magieno/angular-media';
import {MagienoAdvancedTableComponent} from '@magieno/angular-advanced-table';
import {MagienoAIModule} from '@magieno/angular-ai';
import {NgbOffcanvas, NgbOffcanvasModule, NgbTooltip, NgbTooltipModule} from '@ng-bootstrap/ng-bootstrap';
import { LayoutComponent } from './components/layout/layout.component';
import { HeaderComponent } from './components/header/header.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { TranslationPage } from './pages/translation/translation.page';



@NgModule({
  declarations: [
    ChatPage,
    LayoutComponent,
    HeaderComponent,
    SidebarComponent,
    TranslationPage,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    DragDropModule,
    MagienoDragAndDropComponent,
    MagienoBootstrapDropdownComponent,
    MagienoCodeEditorModule,
    MagienoCoreModule,
    MagienoMediaModule,
    MagienoAdvancedTableComponent,
    MagienoAIModule,
    NgbTooltipModule,
    NgbOffcanvasModule,
  ],
  exports: [
    ChatPage,
  ]
})
export class WebAiStudioModule { }
