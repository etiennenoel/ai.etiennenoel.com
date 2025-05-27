import {Component, EventEmitter, Inject, Input, OnInit, Output, PLATFORM_ID} from '@angular/core';
import {TaskStatus} from '../../../enums/task-status.enum';
import {RequirementStatus} from '../../../enums/requirement-status.enum';
import {DOCUMENT, isPlatformBrowser} from '@angular/common';
import {FormControl} from '@angular/forms';
import {
  BaseWritingAssistanceApiComponent
} from '../../../components/base-writing-assistance-api/base-writing-assistance-api.component';
import {AvailabilityStatusEnum} from '../../../enums/availability-status.enum';
import {RewriterLengthEnum} from '../../../enums/rewriter-length.enum';
import {RewriterFormatEnum} from '../../../enums/rewriter-format.enum';
import {RewriterToneEnum} from '../../../enums/rewriter-tone.enum';
import {ActivatedRoute, Router} from '@angular/router';
import {RequirementInterface} from '../../../interfaces/requirement.interface';
import {Title} from '@angular/platform-browser';
import {ExecutionPerformanceManager} from '../../../managers/execution-performance.manager';
import {BuiltInAiApiEnum} from '../../../enums/built-in-ai-api.enum';


@Component({
  selector: 'app-rewriter',
  templateUrl: './rewriter-api.component.html',
  standalone: false,
  styleUrl: './rewriter-api.component.scss'
})
export class RewriterApiComponent extends BaseWritingAssistanceApiComponent implements OnInit {

  // <editor-fold desc="Tone">
  private _tone: RewriterToneEnum | null = RewriterToneEnum.AsIs;
  public toneFormControl: FormControl<RewriterToneEnum | null> = new FormControl<RewriterToneEnum | null>(RewriterToneEnum.AsIs);

  get tone(): RewriterToneEnum | null {
    return this._tone;
  }

  @Input()
  set tone(value: RewriterToneEnum | null) {
   this.setTone(value);
  }

  setTone(value: RewriterToneEnum | null, options?: {emitFormControlEvent?: boolean, emitChangeEvent?: boolean}) {
    this._tone = value;
    this.toneFormControl.setValue(value, {emitEvent: options?.emitFormControlEvent ?? true});
    if(options?.emitChangeEvent ?? true) {
      this.toneChange.emit(value);
    }
    this.router.navigate(['.'], { relativeTo: this.route, queryParams: { rewriterTone: value}, queryParamsHandling: 'merge' });
  }

  @Output()
  toneChange = new EventEmitter<RewriterToneEnum | null>();
  // </editor-fold>

  // <editor-fold desc="Format">
  private _format: RewriterFormatEnum | null = RewriterFormatEnum.PlainText;
  public formatFormControl: FormControl<RewriterFormatEnum | null> = new FormControl<RewriterFormatEnum | null>(RewriterFormatEnum.PlainText);

  get format(): RewriterFormatEnum | null {
    return this._format;
  }

  @Input()
  set format(value: RewriterFormatEnum | null) {
    this.setFormat(value);
  }

  setFormat(value: RewriterFormatEnum | null, options?: {emitFormControlEvent?: boolean, emitChangeEvent?: boolean}) {
    this._format = value;
    this.formatFormControl.setValue(value, {emitEvent: options?.emitFormControlEvent ?? true});
    if(options?.emitChangeEvent ?? true) {
      this.formatChange.emit(value);
    }
    this.router.navigate(['.'], { relativeTo: this.route, queryParams: { rewriterFormat: value}, queryParamsHandling: 'merge' });
  }

  @Output()
  formatChange = new EventEmitter<RewriterFormatEnum | null>();
  // </editor-fold>

  // <editor-fold desc="Length">
  private _length: RewriterLengthEnum | null = RewriterLengthEnum.AsIs;
  public lengthFormControl: FormControl<RewriterLengthEnum | null> = new FormControl<RewriterLengthEnum | null>(RewriterLengthEnum.AsIs);

  get length(): RewriterLengthEnum | null {
    return this._length;
  }

  @Input()
  set length(value: RewriterLengthEnum | null) {
    this.setLength(value);
  }

  setLength(value: RewriterLengthEnum | null, options?: {emitFormControlEvent?: boolean, emitChangeEvent?: boolean}) {
    this._length = value;
    this.lengthFormControl.setValue(value, {emitEvent: options?.emitFormControlEvent ?? true});
    if(options?.emitChangeEvent ?? true) {
      this.lengthChange.emit(value);
    }
    this.router.navigate(['.'], { relativeTo: this.route, queryParams: { rewriterLength: value}, queryParamsHandling: 'merge' });
  }

  @Output()
  lengthChange = new EventEmitter<RewriterLengthEnum | null>();
  // </editor-fold>

  apiFlagContentHtml = `Activate <span class="code">chrome://flags/#rewriter-api-for-gemini-nano</span>`;
  getRequirement(): RequirementInterface {
    return {
      ...this.apiFlag,
      contentHtml: this.apiFlagContentHtml,
    }
  }

  get checkAvailabilityCode() {
    return `Rewriter.availability({
  tone: '${this.toneFormControl.value}',
  format: '${this.formatFormControl.value}',
  length: '${this.lengthFormControl.value}',
  expectedInputLanguages: ${JSON.stringify(this.expectedInputLanguagesFormControl.value)},
  expectedContextLanguages: ${JSON.stringify(this.expectedContextLanguagesFormControl.value)},
  outputLanguage: '${this.outputLanguageFormControl.value}',
})`
  }

  get rewriteCode() {
    if(this.useStreamingFormControl.value) {
      return `const abortController = new AbortController();

const rewriter = await Rewriter.create({
  tone: '${this.toneFormControl.value}',
  format: '${this.formatFormControl.value}',
  length: '${this.lengthFormControl.value}',
  sharedContext: '${this.sharedContext}',
  expectedInputLanguages: ${JSON.stringify(this.expectedInputLanguagesFormControl.value)},
  expectedContextLanguages: ${JSON.stringify(this.expectedContextLanguagesFormControl.value)},
  outputLanguage: '${this.outputLanguageFormControl.value}',
  monitor(m: any)  {
    m.addEventListener("downloadprogress", (e: any) => {
      console.log(\`Downloaded \${e.loaded * 100}%\`);
    });
  },
  signal: abortController.signal,
})

const stream: ReadableStream = rewriter.rewriteStreaming('${this.input}', {context: '${this.contextFormControl.value}'});

let output = "";

for await (const chunk of stream) {
  // Do something with each 'chunk'
  output += chunk;
}

// See the complete response here
console.log(output);
`;
    } else {
      return `const abortController = new AbortController();

const rewriter = await Rewriter.create({
  tone: '${this.toneFormControl.value}',
  format: '${this.formatFormControl.value}',
  length: '${this.lengthFormControl.value}',
  sharedContext: '${this.sharedContext}',
  expectedInputLanguages: ${JSON.stringify(this.expectedInputLanguagesFormControl.value)},
  expectedContextLanguages: ${JSON.stringify(this.expectedContextLanguagesFormControl.value)},
  outputLanguage: '${this.outputLanguageFormControl.value}',
  monitor(m: any)  {
    m.addEventListener("downloadprogress", (e: any) => {
      console.log(\`Downloaded \${e.loaded * 100}%\`);
    });
  },
  signal: abortController.signal,
})

const output = await rewriter.rewrite('${this.input}', {context: '${this.contextFormControl.value}'})

// See the complete response here
console.log(output);
`;
    }
  }

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(DOCUMENT) document: Document,
    router: Router,
    route: ActivatedRoute,
    title: Title,
    public readonly executionPerformanceManager: ExecutionPerformanceManager,
  ) {
    super(document, router, route, title);
  }


  override ngOnInit() {
    super.ngOnInit();

    this.checkRequirements()
    this.executionPerformanceManager.reset()

    this.subscriptions.push(this.route.queryParams.subscribe((params) => {
      if (params['rewriterTone']) {
        this.toneFormControl.setValue(params['rewriterTone']);
      }

      if (params['rewriterFormat']) {
        this.formatFormControl.setValue(params['rewriterFormat']);
      }

      if (params['rewriterLength']) {
        this.lengthFormControl.setValue(params['rewriterLength']);
      }
    }));


    // Register form changes events
    this.subscriptions.push(this.toneFormControl.valueChanges.subscribe((value) => {
      this.setTone(value, {emitChangeEvent: true, emitFormControlEvent: false});
    }));
    this.subscriptions.push(this.formatFormControl.valueChanges.subscribe((value) => {
      this.setFormat(value, {emitChangeEvent: true, emitFormControlEvent: false});
    }));
    this.subscriptions.push(this.lengthFormControl.valueChanges.subscribe((value) => {
      this.setLength(value);
    }));
  }

  checkRequirements() {
    if (isPlatformBrowser(this.platformId) && (!this.window || !("Rewriter" in this.window))) {
      this.apiFlag.status = RequirementStatus.Fail;
      this.apiFlag.message = "'Rewriter' is not defined. Activate the flag.";
    }
    else if(isPlatformBrowser(this.platformId)) {
      this.apiFlag.status = RequirementStatus.Pass;
      this.apiFlag.message = "Passed";
    }
  }

  async checkAvailability() {
    try {
      // @ts-expect-error
      this.availabilityStatus = await Rewriter.availability({
        tone: this.toneFormControl.value,
        format: this.formatFormControl.value,
        length: this.lengthFormControl.value,
        expectedInputLanguages: this.expectedInputLanguagesFormControl.value,
        expectedContextLanguages: this.expectedContextLanguagesFormControl.value,
        outputLanguage: this.outputLanguageFormControl.value
      })
    } catch (e: any) {
      this.availabilityStatus = AvailabilityStatusEnum.Unavailable
      this.availabilityError = e;
      this.errorChange.emit(e);
    }
  }

  async rewrite() {
    this.status = TaskStatus.Executing;
    this.outputCollapsed = false;
    this.outputStatusMessage = "Preparing and downloading model...";
    this.outputChunks = [];
    this.outputChunksChange.emit(this.outputChunks);
    this.output = "";
    this.error = undefined;
    this.outputStatusMessage = "Running query...";
    this.loaded = 0;
    this.executionPerformanceManager.start(BuiltInAiApiEnum.Rewriter)

    try {
      const self = this;
      this.abortControllerFromCreate  = new AbortController();
      this.abortController = new AbortController();

      this.executionPerformanceManager.sessionCreationStarted({
        tone: this.toneFormControl.value,
        format: this.formatFormControl.value,
        length: this.lengthFormControl.value,
        sharedContext: this.sharedContext,
        expectedInputLanguages: this.expectedInputLanguagesFormControl.value,
        expectedContextLanguages: this.expectedContextLanguagesFormControl.value,
        outputLanguage: this.outputLanguageFormControl.value,})

      // @ts-expect-error
      const rewriter = await Rewriter.create({
        tone: this.toneFormControl.value,
        format: this.formatFormControl.value,
        length: this.lengthFormControl.value,
        sharedContext: this.sharedContext,
        expectedInputLanguages: this.expectedInputLanguagesFormControl.value,
        expectedContextLanguages: this.expectedContextLanguagesFormControl.value,
        outputLanguage: this.outputLanguageFormControl.value,
        monitor(m: any)  {
          m.addEventListener("downloadprogress", (e: any) => {
            console.log(`Downloaded ${e.loaded * 100}%`);
            self.loaded = e.loaded;

            self.executionPerformanceManager.downloadUpdated(e.loaded)
          });
        },
        signal: this.abortControllerFromCreate.signal,
      });
      this.executionPerformanceManager.sessionCreationCompleted();

      this.executionPerformanceManager.inferenceStarted({streaming: this.useStreamingFormControl.value, input: this.input, context: this.contextFormControl.value})
      if(this.useStreamingFormControl.value) {
        const stream: ReadableStream = rewriter.rewriteStreaming(this.input, {context: this.contextFormControl.value, signal: this.abortController.signal});

        for await (const chunk of stream) {
          this.executionPerformanceManager.tokenReceived();

          // Do something with each 'chunk'
          this.output += chunk;
          this.outputChunks.push(chunk);
          this.outputChunksChange.emit(this.outputChunks);
        }
      }
      else {
        const output = await rewriter.rewrite(this.input, {context: this.contextFormControl.value, signal: this.abortController.signal});
        this.executionPerformanceManager.tokenReceived()

        this.output = output;
      }

      this.status = TaskStatus.Completed;
    } catch (e: any) {
      this.status = TaskStatus.Error;
      this.outputStatusMessage = `Error: ${e}`;
      this.errorChange.emit(e);
      this.error = e;
      this.executionPerformanceManager.sessionCreationCompleted();
    } finally {
      this.executionPerformanceManager.inferenceCompleted();
    }

  }

  RewriterToneEnum = RewriterToneEnum;
  RewriterFormatEnum = RewriterFormatEnum;
  RewriterLengthEnum = RewriterLengthEnum;
}
