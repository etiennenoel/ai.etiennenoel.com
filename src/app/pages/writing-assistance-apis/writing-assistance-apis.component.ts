import {Component, Inject, OnDestroy, OnInit, PLATFORM_ID, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {FormControl} from '@angular/forms';
import {WriterToneEnum} from '../../enums/writer-tone.enum';
import {RequirementStatus} from '../../enums/requirement-status.enum';
import {RequirementInterface} from './interfaces/requirement.interface';
import {DOCUMENT, isPlatformBrowser} from '@angular/common';
import {TaskStatus} from '../../enums/task-status.enum';
import {BaseComponent} from '../../components/base/base.component';
import {WriterLengthEnum} from '../../enums/writer-length.enum';
import {WriterFormatEnum} from '../../enums/writer-format.enum';
import {LocaleEnum} from '../../enums/locale.enum';
import {ExecutionPerformanceResultInterface} from '../../interfaces/execution-performance-result.interface';
import {ToastStore} from '../../stores/toast.store';
import {ActiveTabEnum} from './active-tab.enum';
import {window} from 'rxjs';
import {RewriterToneEnum} from '../../enums/rewriter-tone.enum';
import {RewriterFormatEnum} from '../../enums/rewriter-format.enum';
import {RewriterLengthEnum} from '../../enums/rewriter-length.enum';
import {SummarizerTypeEnum} from '../../enums/summarizer-type.enum';
import {SummarizerFormatEnum} from '../../enums/summarizer-format.enum';
import {SummarizerLengthEnum} from '../../enums/summarizer-length.enum';
import {WriterApiComponent} from '../writer-api/writer-api.component';
import {RewriterApiComponent} from '../../components/rewriter-api/rewriter-api.component';
import {SummarizerApiComponent} from '../../components/summarizer-api/summarizer-api.component';
import {Title} from '@angular/platform-browser';


@Component({
  selector: 'app-writing-assistance-apis',
  templateUrl: './writing-assistance-apis.component.html',
  standalone: false,
  styleUrl: './writing-assistance-apis.component.scss'
})
export class WritingAssistanceApisComponent extends BaseComponent implements OnInit, OnDestroy {

  inputFormControl: FormControl<string | null> = new FormControl<string | null>("");
  sharedContextFormControl: FormControl<string | null> = new FormControl<string | null>("");

  protected readonly RequirementStatus = RequirementStatus;

  // <editor-fold desc="Active Tab">
  private _activeTab: ActiveTabEnum = ActiveTabEnum.Writer;

  get activeTab(): ActiveTabEnum {
    return this._activeTab;
  }

  set activeTab(value: ActiveTabEnum) {
    this._activeTab = value;
    this.router.navigate(['.'], { relativeTo: this.route, queryParams: { activeTab: value}, queryParamsHandling: 'merge' });
  }
  // </editor-fold>

  writerTone: WriterToneEnum = WriterToneEnum.Neutral;
  writerFormat: WriterFormatEnum = WriterFormatEnum.PlainText;
  writerLength: WriterLengthEnum = WriterLengthEnum.Medium;
  writerUseStreaming: boolean = false;
  writerContext: string = "";
  writerExpectedInputLanguages: LocaleEnum[] = [];
  writerExpectedContextLanguages: LocaleEnum[] = [];
  writerOutputLanguage: LocaleEnum = LocaleEnum.en;

  rewriterTone: RewriterToneEnum = RewriterToneEnum.AsIs;
  rewriterFormat: RewriterFormatEnum = RewriterFormatEnum.PlainText;
  rewriterLength: RewriterLengthEnum = RewriterLengthEnum.AsIs;
  rewriterUseStreaming: boolean = false;
  rewriterContext: string = "";
  rewriterExpectedInputLanguages: LocaleEnum[] = [];
  rewriterExpectedContextLanguages: LocaleEnum[] = [];
  rewriterOutputLanguage: LocaleEnum = LocaleEnum.en;

  summarizerType: SummarizerTypeEnum = SummarizerTypeEnum.Headline;
  summarizerFormat: SummarizerFormatEnum = SummarizerFormatEnum.PlainText;
  summarizerLength: SummarizerLengthEnum = SummarizerLengthEnum.Medium;
  summarizerUseStreaming: boolean = false;
  summarizerContext: string = "";
  summarizerExpectedInputLanguages: LocaleEnum[] = [];
  summarizerExpectedContextLanguages: LocaleEnum[] = [];
  summarizerOutputLanguage: LocaleEnum = LocaleEnum.en;

  output: string = "";
  outputChunks: string[] = [];
  error?: Error;

  abortController: AbortController | null = null;
  abortFromCreateController: AbortController | null = null;

  outputCollapsed: boolean = false;

  loaded:number = 0;

  status: TaskStatus = TaskStatus.Idle;

  requirements: RequirementInterface = {
    writerApiFlag: {
      status: RequirementStatus.Pending,
      message: "Checking",
    },
    rewriterApiFlag: {
      status: RequirementStatus.Pending,
      message: "Checking",
    },
    summarizerApiFlag: {
      status: RequirementStatus.Pending,
      message: "Checking",
    }
  }

  executionPerformanceResult: ExecutionPerformanceResultInterface = {
    startedExecutionAt: 0,
    firstResponseIn: 0,
    elapsedTime: 0,
    totalExecutionTime: 0,
    firstResponseNumberOfWords: 0,
    totalNumberOfWords: 0,
  }

  @ViewChild(WriterApiComponent)
  writerApiComponent: WriterApiComponent | undefined;

  @ViewChild(RewriterApiComponent)
  rewriterApiComponent: RewriterApiComponent | undefined;

  @ViewChild(SummarizerApiComponent)
  summarizerApiComponent: SummarizerApiComponent | undefined

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(DOCUMENT) document: Document,
    private readonly router: Router,
    private route: ActivatedRoute,
    private readonly toastStore: ToastStore,
    private readonly title: Title,
              ) {
    super(document);
  }


  checkRewriterRequirements() {
    if (isPlatformBrowser(this.platformId) && !("ai" in window)) {
      this.requirements.rewriterApiFlag.status = RequirementStatus.Fail;
      this.requirements.rewriterApiFlag.message = "'window.ai' is not defined. Activate the flag.";
    }
    // @ts-ignore
    else if (isPlatformBrowser(this.platformId) && !("rewriter" in window.ai)) {
      this.requirements.rewriterApiFlag.status = RequirementStatus.Fail;
      this.requirements.rewriterApiFlag.message = "'window.ai.rewriter' is not defined. Activate the flag.";
    } else {
      this.requirements.rewriterApiFlag.status = RequirementStatus.Pass;
      this.requirements.rewriterApiFlag.message = "Passed";
    }
  }


  checkSummarizerRequirements() {
    if (isPlatformBrowser(this.platformId) && !("ai" in window)) {
      this.requirements.summarizerApiFlag.status = RequirementStatus.Fail;
      this.requirements.summarizerApiFlag.message = "'window.ai' is not defined. Activate the flag.";
    }
    // @ts-ignore
    else if (isPlatformBrowser(this.platformId) && !("summarizer" in window.ai)) {
      this.requirements.summarizerApiFlag.status = RequirementStatus.Fail;
      this.requirements.summarizerApiFlag.message = "'window.ai.summarizer' is not defined. Activate the flag.";
    } else {
      this.requirements.summarizerApiFlag.status = RequirementStatus.Pass;
      this.requirements.summarizerApiFlag.message = "Passed";
    }
  }

  override ngOnInit() {
    super.ngOnInit();

    this.title.setTitle('Writing Assistance APIs | AI Playground | etiennenoel.com');

    this.checkRewriterRequirements();
    this.checkSummarizerRequirements();

    this.subscriptions.push(this.route.queryParams.subscribe((params) => {
      if(params['input']) {
        this.inputFormControl.setValue(params['input']);
      }

      if(params['sharedContext']) {
        this.sharedContextFormControl.setValue(params['sharedContext']);
      }

      if(params['activeTab']) {
        this.activeTab = params['activeTab'];
      }

      if(params['writerTone']) {
        this.writerTone = params['writerTone'];
      }

      if(params['writerFormat']) {
        this.writerFormat = params['writerFormat'];
      }

      if(params['writerLength']) {
        this.writerLength = params['writerLength'];
      }

      if(params['writerUseStreaming']) {
        this.writerUseStreaming = params['writerUseStreaming'] !== "false";
      }

      if(params['writerContext']) {
        this.writerContext = params['writerContext'];
      }

      if(params['writerExpectedInputLanguages']) {
        if(!Array.isArray(params['writerExpectedInputLanguages'])) {
          this.writerExpectedInputLanguages = [params['writerExpectedInputLanguages']];
        } else {
          this.writerExpectedInputLanguages = params['writerExpectedInputLanguages'];
        }

      }
      if(params['writerExpectedContextLanguages']) {
        if(!Array.isArray(params['writerExpectedContextLanguages'])) {
          this.writerExpectedContextLanguages = [params['writerExpectedContextLanguages']];
        } else {
          this.writerExpectedContextLanguages = params['writerExpectedContextLanguages'];
        }
      }

      if(params['writerOutputLanguage']) {
        this.writerOutputLanguage = params['writerOutputLanguage'];
      }

      // Rewriter
      if(params['rewriterTone']) {
        this.rewriterTone = params['rewriterTone'];
      }

      if(params['rewriterFormat']) {
        this.rewriterFormat = params['rewriterFormat'];
      }

      if(params['rewriterLength']) {
        this.rewriterLength = params['rewriterLength'];
      }

      if(params['rewriterUseStreaming']) {
        this.rewriterUseStreaming = params['rewriterUseStreaming'] !== "false";
      }

      if(params['rewriterContext']) {
        this.rewriterContext = params['rewriterContext'];
      }

      if(params['rewriterExpectedInputLanguages']) {
        if(!Array.isArray(params['rewriterExpectedInputLanguages'])) {
          this.rewriterExpectedInputLanguages = [params['rewriterExpectedInputLanguages']];
        } else {
          this.rewriterExpectedInputLanguages = params['rewriterExpectedInputLanguages'];
        }

      }
      if(params['rewriterExpectedContextLanguages']) {
        if(!Array.isArray(params['rewriterExpectedContextLanguages'])) {
          this.rewriterExpectedContextLanguages = [params['rewriterExpectedContextLanguages']];
        } else {
          this.rewriterExpectedContextLanguages = params['rewriterExpectedContextLanguages'];
        }
      }

      if(params['rewriterOutputLanguage']) {
        this.rewriterOutputLanguage = params['rewriterOutputLanguage'];
      }

      // Summarizer
      if(params['summarizerType']) {
        this.summarizerType = params['summarizerType'];
      }

      if(params['summarizerFormat']) {
        this.summarizerFormat = params['summarizerFormat'];
      }

      if(params['summarizerLength']) {
        this.summarizerLength = params['summarizerLength'];
      }

      if(params['summarizerUseStreaming']) {
        this.summarizerUseStreaming = params['summarizerUseStreaming'] !== "false";
      }

      if(params['summarizerContext']) {
        this.summarizerContext = params['summarizerContext'];
      }

      if(params['summarizerExpectedInputLanguages']) {
        if(!Array.isArray(params['summarizerExpectedInputLanguages'])) {
          this.summarizerExpectedInputLanguages = [params['summarizerExpectedInputLanguages']];
        } else {
          this.summarizerExpectedInputLanguages = params['summarizerExpectedInputLanguages'];
        }

      }
      if(params['summarizerExpectedContextLanguages']) {
        if(!Array.isArray(params['summarizerExpectedContextLanguages'])) {
          this.summarizerExpectedContextLanguages = [params['summarizerExpectedContextLanguages']];
        } else {
          this.summarizerExpectedContextLanguages = params['summarizerExpectedContextLanguages'];
        }
      }

      if(params['summarizerOutputLanguage']) {
        this.summarizerOutputLanguage = params['summarizerOutputLanguage'];
      }
    }));

    this.subscriptions.push(this.inputFormControl.valueChanges.subscribe((value) => {
      this.router.navigate(['.'], { relativeTo: this.route, queryParams: { input: value}, queryParamsHandling: 'merge' });
    }))

    this.subscriptions.push(this.sharedContextFormControl.valueChanges.subscribe((value) => {
      this.router.navigate(['.'], { relativeTo: this.route, queryParams: { sharedContext: value}, queryParamsHandling: 'merge' });
    }))
  }

  copyToClipboard(chunk: string) {
    navigator.clipboard.writeText(chunk)
    this.toastStore.publish({
      message: "Copied to clipboard",
    })
  }

  execute() {
    switch (this.activeTab) {
      case ActiveTabEnum.Writer:
        this.writerApiComponent?.write();
        break;
      case ActiveTabEnum.Rewriter:
        this.rewriterApiComponent?.rewrite();
        break;
      case ActiveTabEnum.Summarizer:
        this.summarizerApiComponent?.summarize();
        break;
    }
  }

  executionPerformanceChange(value: ExecutionPerformanceResultInterface) {
    this.executionPerformanceResult = value;
  }

  outputChange(value: string) {
    this.output = value;
  }

  statusChange(value: TaskStatus) {
    this.status = value;
    this.window?.scroll(0,0);
  }

  outputChunksChange(value: string[]) {
    this.outputChunks = value;
  }

  loadedChange(value: number) {
    this.loaded = value;
  }

  errorChange(value: Error) {
    this.error = value;
  }

  abortControllerChange(value: AbortController | null) {
    this.abortController = value;
  }

  abortExecution() {
   this.abortController?.abort();
  }

  abortControllerFromCreateChange(value: AbortController | null) {
    this.abortFromCreateController = value;
  }

  abortExecutionFromCreate() {
   this.abortFromCreateController?.abort();
  }

  writerToneChange() {
    this.router.navigate(['.'], { relativeTo: this.route, queryParams: { writerTone: this.writerTone}, queryParamsHandling: 'merge' });
  }

  writerFormatChange() {
    this.router.navigate(['.'], { relativeTo: this.route, queryParams: { writerFormat: this.writerFormat}, queryParamsHandling: 'merge' });
  }

  writerLengthChange() {
    this.router.navigate(['.'], { relativeTo: this.route, queryParams: { writerLength: this.writerLength}, queryParamsHandling: 'merge' });
  }

  writerContextChange() {
    this.router.navigate(['.'], { relativeTo: this.route, queryParams: { writerContext: this.writerContext}, queryParamsHandling: 'merge' });
  }

  writerUseStreamingChange() {
    this.router.navigate(['.'], { relativeTo: this.route, queryParams: { writerUseStreaming: this.writerUseStreaming}, queryParamsHandling: 'merge' });
  }

  writerExpectedInputLanguagesChange() {
    this.router.navigate(['.'], { relativeTo: this.route, queryParams: { writerExpectedInputLanguages: this.writerExpectedInputLanguages}, queryParamsHandling: 'merge' });
  }

  writerExpectedContextLanguagesChange() {
    this.router.navigate(['.'], { relativeTo: this.route, queryParams: { writerExpectedContextLanguages: this.writerExpectedContextLanguages}, queryParamsHandling: 'merge' });
  }

  writerOutputLanguageChange() {
    this.router.navigate(['.'], { relativeTo: this.route, queryParams: { writerOutputLanguage: this.writerOutputLanguage}, queryParamsHandling: 'merge' });
  }
  rewriterToneChange() {
    this.router.navigate(['.'], { relativeTo: this.route, queryParams: { rewriterTone: this.rewriterTone}, queryParamsHandling: 'merge' });
  }

  rewriterFormatChange() {
    this.router.navigate(['.'], { relativeTo: this.route, queryParams: { rewriterFormat: this.rewriterFormat}, queryParamsHandling: 'merge' });
  }

  rewriterLengthChange() {
    this.router.navigate(['.'], { relativeTo: this.route, queryParams: { rewriterLength: this.rewriterLength}, queryParamsHandling: 'merge' });
  }

  rewriterContextChange() {
    this.router.navigate(['.'], { relativeTo: this.route, queryParams: { rewriterContext: this.rewriterContext}, queryParamsHandling: 'merge' });
  }

  rewriterUseStreamingChange() {
    this.router.navigate(['.'], { relativeTo: this.route, queryParams: { rewriterUseStreaming: this.rewriterUseStreaming}, queryParamsHandling: 'merge' });
  }

  rewriterExpectedInputLanguagesChange() {
    this.router.navigate(['.'], { relativeTo: this.route, queryParams: { rewriterExpectedInputLanguages: this.rewriterExpectedInputLanguages}, queryParamsHandling: 'merge' });
  }

  rewriterExpectedContextLanguagesChange() {
    this.router.navigate(['.'], { relativeTo: this.route, queryParams: { rewriterExpectedContextLanguages: this.rewriterExpectedContextLanguages}, queryParamsHandling: 'merge' });
  }

  rewriterOutputLanguageChange() {
    this.router.navigate(['.'], { relativeTo: this.route, queryParams: { rewriterOutputLanguage: this.rewriterOutputLanguage}, queryParamsHandling: 'merge' });
  }

  // Summarizer
  summarizerToneChange() {
    this.router.navigate(['.'], { relativeTo: this.route, queryParams: { summarizerType: this.summarizerType}, queryParamsHandling: 'merge' });
  }

  summarizerFormatChange() {
    this.router.navigate(['.'], { relativeTo: this.route, queryParams: { summarizerFormat: this.summarizerFormat}, queryParamsHandling: 'merge' });
  }

  summarizerLengthChange() {
    this.router.navigate(['.'], { relativeTo: this.route, queryParams: { summarizerLength: this.summarizerLength}, queryParamsHandling: 'merge' });
  }

  summarizerContextChange() {
    this.router.navigate(['.'], { relativeTo: this.route, queryParams: { summarizerContext: this.summarizerContext}, queryParamsHandling: 'merge' });
  }

  summarizerUseStreamingChange() {
    this.router.navigate(['.'], { relativeTo: this.route, queryParams: { summarizerUseStreaming: this.summarizerUseStreaming}, queryParamsHandling: 'merge' });
  }

  summarizerExpectedInputLanguagesChange() {
    this.router.navigate(['.'], { relativeTo: this.route, queryParams: { summarizerExpectedInputLanguages: this.summarizerExpectedInputLanguages}, queryParamsHandling: 'merge' });
  }

  summarizerExpectedContextLanguagesChange() {
    this.router.navigate(['.'], { relativeTo: this.route, queryParams: { summarizerExpectedContextLanguages: this.summarizerExpectedContextLanguages}, queryParamsHandling: 'merge' });
  }

  summarizerOutputLanguageChange() {
    this.router.navigate(['.'], { relativeTo: this.route, queryParams: { summarizerOutputLanguage: this.summarizerOutputLanguage}, queryParamsHandling: 'merge' });
  }

  protected readonly navigator = navigator;
  protected readonly ActiveTabEnum = ActiveTabEnum;
}
