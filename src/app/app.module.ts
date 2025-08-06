import {NgModule} from '@angular/core';
import {BrowserModule, provideClientHydration, withEventReplay} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {RootComponent} from './components/root/root.component';
import {TranslatorApiComponent} from './pages/built-in-ai-apis/translator-api/translator-api.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {PerformanceResultRepository} from './repositories/performance-result.repository'; // Added import
import {StepStatusIconComponent} from "./components/step-status-icon/step-status-icon.component";
import {StepTitleComponent} from "./components/step-title/step-title.component";
import {StepContainerVisualStatusDirective} from "./directives/step-container-visual-status.directive";
import {SearchSelectDropdownComponent} from './components/search-select-dropdown/search-select-dropdown.component';
import {EnumToSearchSelectDropdownOptionsPipe} from './pipes/enum-to-search-select-dropdown-options.pipe';
import {WriterApiPage} from './pages/built-in-ai-apis/writer-api/writer-api.page';
import {CodeEditorComponent} from './components/code-editor/code-editor.component';
import {
  SearchSelectMultipleDropdownComponent
} from './components/search-select-multiple-dropdown/search-select-multiple-dropdown.component';
import {ToastStore} from './stores/toast.store';
import {ToastComponent} from './components/toast/toast.component';
import {RewriterApiComponent} from './pages/built-in-ai-apis/rewriter-api/rewriter-api.component';
import {SummarizerApiComponent} from './pages/built-in-ai-apis/summarizer-api/summarizer-api.component';
import {PromptApiComponent} from './pages/built-in-ai-apis/prompt-api/prompt-api.component';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {PromptComponent} from './components/prompt/prompt.component';
import {OutputComponent} from './components/output/output.component';
import {CardComponent} from './components/card/card.component';
import {LanguageDetectorComponent} from './pages/built-in-ai-apis/language-detector/language-detector.component';
import {RequirementComponent} from './components/requirement/requirement.component';
import {IndexPage} from './pages/index/index.page';
import {SidebarComponent} from './components/sidebar/sidebar.component';
import {LayoutComponent} from './components/layout/layout.component';
import {PageTitleComponent} from './components/page-title/page-title.component';
import {PageAccordionComponent} from './components/page-accordion/page-accordion.component';
// @start-remove-in-chrome-dev
import {MultimodalPromptApiComponent} from './pages/built-in-ai-apis/multimodal-prompt-api/multimodal-prompt-api.component';
import {AudioMultimodalPromptComponent} from './pages/built-in-ai-apis/audio-multimodal-prompt-api/audio-multimodal-prompt.component';
import {AudioPromptFromUrlComponent} from './components/audio-prompt-from-url/audio-prompt-from-url.component';
import {AudioPromptFromFileComponent} from './components/audio-prompt-from-file/audio-prompt-from-file.component';
import {
  AudioPromptFromMicrophoneComponent
} from './components/audio-prompt-from-microphone/audio-prompt-from-microphone.component';
import {AudioRecordingService} from './services/audio-recording.service';
import {
  TranscriptionAudioMultimodalPromptComponent
} from './pages/built-in-ai-apis/transcription-audio-multimodal-prompt-api/transcription-audio-multimodal-prompt.component';
import {AudioVisualizerService} from './services/audio-visualizer.service';
// @end
import {MagienoDragAndDropComponent} from '@magieno/angular-drag-and-drop';
import {Environment} from './environments/environment';
import {MagienoBootstrapDropdownComponent} from '@magieno/angular-bootstrap-dropdown';
import {EnumToMagienoDropdownItemsPipe} from './pipes/enum-to-magieno-dropdown-items.pipe';
import {DownloadTesterPage} from './pages/download-tester/download-tester.page';
import {ProofreaderApiComponent} from './pages/built-in-ai-apis/proofreader-api/proofreader-api.component';
import {AutocompleteComponent} from './pages/built-in-ai-apis/autocomplete/autocomplete.component';
import {ExecutionPerformanceManager} from './managers/execution-performance.manager';
import {InferencePerformanceManager} from '../performance-test/managers/inference-performance.manager';
import {ExecutionPerformanceComponent} from './components/execution-performance/execution-performance.component';
import {PerformanceResultManager} from './managers/performance-result.manager';
import {PerformanceHistoryPage} from './pages/performance/performance-history/performance-history.page';
import {MinutesAgoPipe} from './pipes/minutes-ago.pipe';
import {PerformanceTestRunnerPage} from './pages/performance/performance-test-runner/performance-test-runner.page';
import {PerformanceTestManager} from '../performance-test/managers/performance-test.manager';
import {
  SummarizerHeadlineSmallTestExecutor
} from '../performance-test/test-executors/summarizer-headline-small.test-executor';
import { PerformanceTestExecutionPage } from './pages/performance/performance-test-execution-page/performance-test-execution-page';
import {SummarizerBatchPageComponent} from './pages/summarizer-batch-page/summarizer-batch-page.component';
import {ImagePromptApiComponent} from './pages/built-in-ai-apis/image-prompt-api/image-prompt-api.component';
import {MagienoCodeEditorComponent} from '@magieno/angular-code-editor';
import {NgbTooltip} from '@ng-bootstrap/ng-bootstrap';


@NgModule({
  declarations: [
    // Global components
    RootComponent,
    LayoutComponent,
    SidebarComponent,

    // Layout components
    CardComponent,
    CodeEditorComponent,
    OutputComponent,
    PageTitleComponent,
    PageAccordionComponent,
    PromptComponent,
    RequirementComponent,
    SearchSelectDropdownComponent,
    SearchSelectMultipleDropdownComponent,
    StepStatusIconComponent,
    StepTitleComponent,
    StepContainerVisualStatusDirective,
    ToastComponent,

    ExecutionPerformanceComponent,

    // Pages
    DownloadTesterPage,
    IndexPage,
    LanguageDetectorComponent,
    PerformanceHistoryPage,
    PerformanceTestRunnerPage,
    PromptApiComponent,
    ProofreaderApiComponent,
    RewriterApiComponent,
    SummarizerApiComponent,
    TranslatorApiComponent,
    SummarizerBatchPageComponent,
    WriterApiPage,

    AutocompleteComponent,

// @start-remove-in-chrome-dev
    AudioMultimodalPromptComponent,
    MultimodalPromptApiComponent,

    AudioPromptFromUrlComponent,
    AudioPromptFromFileComponent,
    AudioPromptFromMicrophoneComponent,

    TranscriptionAudioMultimodalPromptComponent,
// @end

    ImagePromptApiComponent,

    // Pipes
    EnumToSearchSelectDropdownOptionsPipe,
    EnumToMagienoDropdownItemsPipe,
    MinutesAgoPipe,

    // Directives
    StepContainerVisualStatusDirective,
     PerformanceTestExecutionPage,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    DragDropModule,
    MagienoDragAndDropComponent,
    MagienoBootstrapDropdownComponent,
    MagienoCodeEditorComponent,
    NgbTooltip,
  ],
  providers: [
    provideClientHydration(withEventReplay()),

    // @start-remove-in-chrome-dev
    // Services
    AudioRecordingService,
    AudioVisualizerService,
// @end

    // Managers
    ExecutionPerformanceManager,
    InferencePerformanceManager,
    PerformanceResultManager,

    // Stores
    ToastStore,
    PerformanceResultRepository, // Added provider


    //
    // Performance Test
    //

    PerformanceTestManager,
    SummarizerHeadlineSmallTestExecutor,
  ],
  bootstrap: [RootComponent]
})
export class AppModule {
}
