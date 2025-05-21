import {Component, EventEmitter, Inject, Input, OnInit, Output, PLATFORM_ID} from '@angular/core';
import {TaskStatus} from '../../enums/task-status.enum';
import {RequirementStatus} from '../../enums/requirement-status.enum';
import {DOCUMENT, isPlatformBrowser} from '@angular/common';
import {FormControl} from '@angular/forms';
import {BaseWritingAssistanceApiComponent} from '../../components/base-writing-assistance-api/base-writing-assistance-api.component';
import {TextUtils} from '../../utils/text.utils';
import {AvailabilityStatusEnum} from '../../enums/availability-status.enum';
import {SearchSelectDropdownOptionsInterface} from '../../interfaces/search-select-dropdown-options.interface';
import {LocaleEnum} from '../../enums/locale.enum';
import {RewriterLengthEnum} from '../../enums/rewriter-length.enum';
import {RewriterFormatEnum} from '../../enums/rewriter-format.enum';
import {RewriterToneEnum} from '../../enums/rewriter-tone.enum';
import {ActivatedRoute, Router} from '@angular/router';
import {RequirementInterface} from '../../interfaces/requirement.interface'; // Keep for apiFlag override
import {Title} from '@angular/platform-browser'; // Keep for constructor
// Import BasePageComponent
import {BasePageComponent} from '../../components/base/base-page.component';
// BaseWritingAssistanceApiComponent will be removed from extends, specific properties will remain in this class.
// TaskStatus will be inherited from BasePageComponent
// RequirementStatus keep for local apiFlag definition.


@Component({
  selector: 'app-rewriter',
  templateUrl: './rewriter-api.component.html',
  standalone: false,
  styleUrl: './rewriter-api.component.scss'
})
export class RewriterApiComponent extends BasePageComponent implements OnInit {
  // Properties from BaseWritingAssistanceApiComponent that are not in BasePageComponent
  // need to remain here.
  // Example: input, context, language controls, tone, format, length etc.
  // Also, executionPerformance and related methods.

  // <editor-fold desc="Input">
  private _input: string = "Make this text better.";
  public inputFormControl: FormControl<string | null> = new FormControl<string | null>(this._input);
  get input(): string {
    return this._input;
  }
  @Input()
  set input(value: string) {
    this.setInput(value);
  }
  setInput(value: string, options?: {emitFormControlEvent?: boolean, emitChangeEvent?: boolean}) {
    this._input = value;
    this.inputFormControl.setValue(value, {emitEvent: options?.emitFormControlEvent ?? true});
    if(options?.emitChangeEvent ?? true) {
      this.inputChange.emit(value);
    }
    this.router.navigate(['.'], { relativeTo: this.route, queryParams: { input: value}, queryParamsHandling: 'merge' });
  }
  @Output()
  inputChange = new EventEmitter<string>();
  // </editor-fold>

  // <editor-fold desc="Context">
  private _context: string | null = null;
  public contextFormControl: FormControl<string | null> = new FormControl<string | null>(null);
  get context(): string | null {
    return this._context;
  }
  @Input()
  set context(value: string | null) {
    this.setContext(value);
  }
  setContext(value: string | null, options?: {emitFormControlEvent?: boolean, emitChangeEvent?: boolean}) {
    this._context = value;
    this.contextFormControl.setValue(value, {emitEvent: options?.emitFormControlEvent ?? true});
    if(options?.emitChangeEvent ?? true) {
      this.contextChange.emit(value);
    }
    this.router.navigate(['.'], { relativeTo: this.route, queryParams: { context: value}, queryParamsHandling: 'merge' });
  }
  @Output()
  contextChange = new EventEmitter<string | null>();
  // </editor-fold>

  // <editor-fold desc="Expected Input Languages">
  private _expectedInputLanguages: LocaleEnum[] | null = [];
  public expectedInputLanguagesFormControl: FormControl<LocaleEnum[] | null> = new FormControl<LocaleEnum[] | null>([]);
  get expectedInputLanguages(): LocaleEnum[] | null {
    return this._expectedInputLanguages;
  }
  @Input()
  set expectedInputLanguages(value: LocaleEnum[] | null) {
    this.setExpectedInputLanguages(value);
  }
  setExpectedInputLanguages(value: LocaleEnum[] | null, options?: {emitFormControlEvent?: boolean, emitChangeEvent?: boolean}) {
    this._expectedInputLanguages = value;
    this.expectedInputLanguagesFormControl.setValue(value, {emitEvent: options?.emitFormControlEvent ?? true});
    if(options?.emitChangeEvent ?? true) {
      this.expectedInputLanguagesChange.emit(value);
    }
    this.router.navigate(['.'], { relativeTo: this.route, queryParams: { expectedInputLanguages: value}, queryParamsHandling: 'merge' });
  }
  @Output()
  expectedInputLanguagesChange = new EventEmitter<LocaleEnum[] | null>();
  // </editor-fold>

  // <editor-fold desc="Expected Context Languages">
  private _expectedContextLanguages: LocaleEnum[] | null = [];
  public expectedContextLanguagesFormControl: FormControl<LocaleEnum[] | null> = new FormControl<LocaleEnum[] | null>([]);
  get expectedContextLanguages(): LocaleEnum[] | null {
    return this._expectedContextLanguages;
  }
  @Input()
  set expectedContextLanguages(value: LocaleEnum[] | null) {
    this.setExpectedContextLanguages(value);
  }
  setExpectedContextLanguages(value: LocaleEnum[] | null, options?: {emitFormControlEvent?: boolean, emitChangeEvent?: boolean}) {
    this._expectedContextLanguages = value;
    this.expectedContextLanguagesFormControl.setValue(value, {emitEvent: options?.emitFormControlEvent ?? true});
    if(options?.emitChangeEvent ?? true) {
      this.expectedContextLanguagesChange.emit(value);
    }
    this.router.navigate(['.'], { relativeTo: this.route, queryParams: { expectedContextLanguages: value}, queryParamsHandling: 'merge' });
  }
  @Output()
  expectedContextLanguagesChange = new EventEmitter<LocaleEnum[] | null>();
  // </editor-fold>

  // <editor-fold desc="Output Language">
  private _outputLanguage: LocaleEnum | null = null;
  public outputLanguageFormControl: FormControl<LocaleEnum | null> = new FormControl<LocaleEnum | null>(null);
  get outputLanguage(): LocaleEnum | null {
    return this._outputLanguage;
  }
  @Input()
  set outputLanguage(value: LocaleEnum | null) {
    this.setOutputLanguage(value);
  }
  setOutputLanguage(value: LocaleEnum | null, options?: {emitFormControlEvent?: boolean, emitChangeEvent?: boolean}) {
    this._outputLanguage = value;
    this.outputLanguageFormControl.setValue(value, {emitEvent: options?.emitFormControlEvent ?? true});
    if(options?.emitChangeEvent ?? true) {
      this.outputLanguageChange.emit(value);
    }
    this.router.navigate(['.'], { relativeTo: this.route, queryParams: { outputLanguage: value}, queryParamsHandling: 'merge' });
  }
  @Output()
  outputLanguageChange = new EventEmitter<LocaleEnum | null>();
  // </editor-fold>

  // <editor-fold desc="Shared Context">
  private _sharedContext: string | null = null;
  public sharedContextFormControl: FormControl<string | null> = new FormControl<string | null>(null);
  get sharedContext(): string | null {
    return this._sharedContext;
  }
  @Input()
  set sharedContext(value: string | null) {
    this.setSharedContext(value);
  }
  setSharedContext(value: string | null, options?: {emitFormControlEvent?: boolean, emitChangeEvent?: boolean}) {
    this._sharedContext = value;
    // this.sharedContextFormControl.setValue(value, {emitEvent: options?.emitFormControlEvent ?? true}); // Assuming no form control for this one
    if(options?.emitChangeEvent ?? true) {
      this.sharedContextChange.emit(value);
    }
    this.router.navigate(['.'], { relativeTo: this.route, queryParams: { sharedContext: value}, queryParamsHandling: 'merge' });
  }
  @Output()
  sharedContextChange = new EventEmitter<string | null>();
  // </editor-fold>

  // <editor-fold desc="Use Streaming">
  private _useStreaming: boolean = true;
  public useStreamingFormControl: FormControl<boolean | null> = new FormControl<boolean | null>(true);
  get useStreaming(): boolean {
    return this._useStreaming;
  }
  @Input()
  set useStreaming(value: boolean) {
    this.setUseStreaming(value);
  }
  setUseStreaming(value: boolean, options?: {emitFormControlEvent?: boolean, emitChangeEvent?: boolean}) {
    this._useStreaming = value;
    this.useStreamingFormControl.setValue(value, {emitEvent: options?.emitFormControlEvent ?? true});
    if(options?.emitChangeEvent ?? true) {
      this.useStreamingChange.emit(value);
    }
    this.router.navigate(['.'], { relativeTo: this.route, queryParams: { useStreaming: value}, queryParamsHandling: 'merge' });
  }
  @Output()
  useStreamingChange = new EventEmitter<boolean>();
  // </editor-fold>

  public outputChunks: string[] = [];
  @Output() outputChunksChange = new EventEmitter<string[]>();

  public executionPerformance = {
    firstResponseTime: 0,
    totalTime: 0,
    firstResponseNumberOfWords: 0,
    totalNumberOfWords: 0,
  }
  @Output() executionPerformanceChange = new EventEmitter<typeof this.executionPerformance>();

  private _startTime = 0;
  private _firstResponseTime = 0;

  // End of properties from BaseWritingAssistanceApiComponent

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

  protected outputStatusMessage: string = ""; // Keep

  // Override apiFlag from BasePageComponent
  public override apiFlag: RequirementInterface = {
    status: RequirementStatus.Pending,
    message: 'Pending',
    contentHtml: `Activate <span class="code">chrome://flags/#rewriter-api-for-gemini-nano</span>`
  };
  // apiFlagContentHtml and getRequirement() removed.

  // Keep availabilityStatus and availabilityError for specific check logic
  public availabilityStatus: AvailabilityStatusEnum = AvailabilityStatusEnum.Unknown;
  public availabilityError?: Error;


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

for await (const chunk of stream) {
  // Do something with each 'chunk'
  this.rewriterOutput += chunk;
}`;
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

await rewriter.rewrite('${this.input}', {context: '${this.contextFormControl.value}'})`;
    }
  }

  constructor(
    @Inject(PLATFORM_ID) platformId: object, // Inject PLATFORM_ID
    @Inject(DOCUMENT) document: Document,
    protected override router: Router, // Add protected override
    protected override route: ActivatedRoute, // Add protected override
    protected override titleService: Title, // Add protected override, rename title
  ) {
    super(platformId, document, router, route, titleService); // Pass all to BasePageComponent constructor
  }


  override ngOnInit() {
    super.ngOnInit();
    this.outputCollapsed = true; // Set desired initial state for inherited property
    this.titleService.setTitle('Rewriter API | AI Playground'); // Set page title

    this.checkRequirements(); // Call implemented abstract method

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

  // Implementation of abstract method
  override checkRequirements(): void {
    // Logic from existing checkRequirements
    if (isPlatformBrowser(this.platformId) && (!this.window || !("Rewriter" in this.window))) {
      this.apiFlag.status = RequirementStatus.Fail; // apiFlag is now the overridden one
      this.apiFlag.message = "'Rewriter' is not defined. Activate the flag.";
    }
    else if(isPlatformBrowser(this.platformId)) {
      this.apiFlag.status = RequirementStatus.Pass;
      this.apiFlag.message = "Passed";
    }
  }

  // Implementation of abstract method
  override async checkAvailability(): Promise<void> {
    try {
      // @ts-expect-error Rewriter is a global
      this.availabilityStatus = await Rewriter.availability({
        tone: this.toneFormControl.value,
        format: this.formatFormControl.value,
        length: this.lengthFormControl.value,
        expectedInputLanguages: this.expectedInputLanguagesFormControl.value,
        expectedContextLanguages: this.expectedContextLanguagesFormControl.value,
        outputLanguage: this.outputLanguageFormControl.value
      });
    } catch (e: any) {
      this.availabilityStatus = AvailabilityStatusEnum.Unavailable;
      this.availabilityError = e; // Keep local availabilityError
      this.error = e; // Also set the inherited error
    }
  }

  // Methods related to executionPerformance are kept as they are not in BasePageComponent
  protected emitExecutionPerformanceChange() {
    this.executionPerformanceChange.emit(this.executionPerformance);
  }

  protected startExecutionTime() {
    this._startTime = performance.now();
    this._firstResponseTime = 0; // Reset first response time
    this.executionPerformance.firstResponseTime = 0;
    this.executionPerformance.totalTime = 0;
    this.emitExecutionPerformanceChange();
  }

  protected lapFirstResponseTime() {
    if (this._firstResponseTime === 0) { // Lap only if not already lapped
      this._firstResponseTime = performance.now();
      this.executionPerformance.firstResponseTime = this._firstResponseTime - this._startTime;
      this.emitExecutionPerformanceChange();
    }
  }

  protected stopExecutionTime() {
    if (this._startTime !== 0) { // Stop only if started
      this.executionPerformance.totalTime = performance.now() - this._startTime;
      this._startTime = 0; // Reset start time
      this.emitExecutionPerformanceChange();
    }
  }

  async rewrite() {
    this.status = TaskStatus.Executing; // Use inherited status
    this.outputCollapsed = false; // Use inherited outputCollapsed
    this.outputStatusMessage = "Preparing and downloading model...";
    this.outputChunks = []; // This property remains local
    this.outputChunksChange.emit(this.outputChunks); // This EventEmitter remains local
    this.output = ""; // Use inherited output
    this.error = undefined; // Use inherited error
    this.outputStatusMessage = "Running query...";
    this.loaded = 0; // Use inherited loaded

    try {
      // const self = this; // self may not be needed if 'this' context is fine
      // Re-initialize inherited controllers
      this.abortController = new AbortController();
      this.abortControllerFromCreate  = new AbortController();

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
          });
        },
        signal: this.abortControllerFromCreate.signal,
      });

      this.startExecutionTime();

      this.executionPerformance.firstResponseNumberOfWords = 0;
      this.executionPerformance.totalNumberOfWords = 0;
      this.emitExecutionPerformanceChange();

      if(this.useStreamingFormControl.value) {
        const stream: ReadableStream = rewriter.rewriteStreaming(this.input, {context: this.contextFormControl.value, signal: this.abortController.signal});

        let hasFirstResponse = false;

        for await (const chunk of stream) {
          if(!hasFirstResponse) {
            hasFirstResponse = true;
            this.lapFirstResponseTime();
          }

          if(this.executionPerformance.firstResponseNumberOfWords == 0) {
            this.executionPerformance.firstResponseNumberOfWords = TextUtils.countWords(chunk);
          }
          this.executionPerformance.totalNumberOfWords += TextUtils.countWords(chunk);

          this.emitExecutionPerformanceChange();

          // Do something with each 'chunk'
          this.output += chunk;
          this.outputChunks.push(chunk);
          this.outputChunksChange.emit(this.outputChunks);
        }

      }
      else {
        const output = await rewriter.rewrite(this.input, {context: this.contextFormControl.value, signal: this.abortController.signal});
        this.executionPerformance.totalNumberOfWords = TextUtils.countWords(output);
        this.emitExecutionPerformanceChange();

        this.output = output;
      }

      this.status = TaskStatus.Completed; // Use inherited status
    } catch (e: any) {
      this.status = TaskStatus.Error; // Use inherited status
      this.outputStatusMessage = `Error: ${e}`;
      // this.errorChange.emit(e); // errorChange is not part of BasePageComponent by default
      this.error = e; // Use inherited error
    } finally {
      this.stopExecutionTime();
    }

  }

  RewriterToneEnum = RewriterToneEnum;
  RewriterFormatEnum = RewriterFormatEnum;
  RewriterLengthEnum = RewriterLengthEnum;
  protected readonly LocaleEnum = LocaleEnum;
}
