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
import {SummarizerTypeEnum} from '../../enums/summarizer-type.enum';
import {SummarizerFormatEnum} from '../../enums/summarizer-format.enum';
import {SummarizerLengthEnum} from '../../enums/summarizer-length.enum';
import {ActivatedRoute, Router} from '@angular/router';
import {RequirementInterface} from '../../interfaces/requirement.interface'; // Keep for apiFlag override
import {Title} from '@angular/platform-browser'; // Keep for constructor
// Import BasePageComponent
import {BasePageComponent} from '../../components/base/base-page.component';
// BaseWritingAssistanceApiComponent will be removed from extends.
// TaskStatus will be inherited. RequirementStatus for local apiFlag.


@Component({
  selector: 'app-summarizer',
  templateUrl: './summarizer-api.component.html',
  standalone: false,
  styleUrl: './summarizer-api.component.scss'
})
export class SummarizerApiComponent extends BasePageComponent implements OnInit {
  // Properties from BaseWritingAssistanceApiComponent to retain:
  // Input, Context, Language FormControls and related properties
  // <editor-fold desc="Input">
  private _input: string = "Make this text better.";
  public inputFormControl: FormControl<string | null> = new FormControl<string | null>(this._input);
  get input(): string { return this._input; }
  @Input() set input(value: string) { this.setInput(value); }
  setInput(value: string, options?: {emitFormControlEvent?: boolean, emitChangeEvent?: boolean}) {
    this._input = value;
    this.inputFormControl.setValue(value, {emitEvent: options?.emitFormControlEvent ?? true});
    if(options?.emitChangeEvent ?? true) { this.inputChange.emit(value); }
    this.router.navigate(['.'], { relativeTo: this.route, queryParams: { input: value}, queryParamsHandling: 'merge' });
  }
  @Output() inputChange = new EventEmitter<string>();
  // </editor-fold>

  // <editor-fold desc="Context">
  private _context: string | null = null;
  public contextFormControl: FormControl<string | null> = new FormControl<string | null>(null);
  get context(): string | null { return this._context; }
  @Input() set context(value: string | null) { this.setContext(value); }
  setContext(value: string | null, options?: {emitFormControlEvent?: boolean, emitChangeEvent?: boolean}) {
    this._context = value;
    this.contextFormControl.setValue(value, {emitEvent: options?.emitFormControlEvent ?? true});
    if(options?.emitChangeEvent ?? true) { this.contextChange.emit(value); }
    this.router.navigate(['.'], { relativeTo: this.route, queryParams: { context: value}, queryParamsHandling: 'merge' });
  }
  @Output() contextChange = new EventEmitter<string | null>();
  // </editor-fold>

  // <editor-fold desc="Expected Input Languages">
  private _expectedInputLanguages: LocaleEnum[] | null = [];
  public expectedInputLanguagesFormControl: FormControl<LocaleEnum[] | null> = new FormControl<LocaleEnum[] | null>([]);
  get expectedInputLanguages(): LocaleEnum[] | null { return this._expectedInputLanguages; }
  @Input() set expectedInputLanguages(value: LocaleEnum[] | null) { this.setExpectedInputLanguages(value); }
  setExpectedInputLanguages(value: LocaleEnum[] | null, options?: {emitFormControlEvent?: boolean, emitChangeEvent?: boolean}) {
    this._expectedInputLanguages = value;
    this.expectedInputLanguagesFormControl.setValue(value, {emitEvent: options?.emitFormControlEvent ?? true});
    if(options?.emitChangeEvent ?? true) { this.expectedInputLanguagesChange.emit(value); }
    this.router.navigate(['.'], { relativeTo: this.route, queryParams: { expectedInputLanguages: value}, queryParamsHandling: 'merge' });
  }
  @Output() expectedInputLanguagesChange = new EventEmitter<LocaleEnum[] | null>();
  // </editor-fold>

  // <editor-fold desc="Expected Context Languages">
  private _expectedContextLanguages: LocaleEnum[] | null = [];
  public expectedContextLanguagesFormControl: FormControl<LocaleEnum[] | null> = new FormControl<LocaleEnum[] | null>([]);
  get expectedContextLanguages(): LocaleEnum[] | null { return this._expectedContextLanguages; }
  @Input() set expectedContextLanguages(value: LocaleEnum[] | null) { this.setExpectedContextLanguages(value); }
  setExpectedContextLanguages(value: LocaleEnum[] | null, options?: {emitFormControlEvent?: boolean, emitChangeEvent?: boolean}) {
    this._expectedContextLanguages = value;
    this.expectedContextLanguagesFormControl.setValue(value, {emitEvent: options?.emitFormControlEvent ?? true});
    if(options?.emitChangeEvent ?? true) { this.expectedContextLanguagesChange.emit(value); }
    this.router.navigate(['.'], { relativeTo: this.route, queryParams: { expectedContextLanguages: value}, queryParamsHandling: 'merge' });
  }
  @Output() expectedContextLanguagesChange = new EventEmitter<LocaleEnum[] | null>();
  // </editor-fold>

  // <editor-fold desc="Output Language">
  private _outputLanguage: LocaleEnum | null = null;
  public outputLanguageFormControl: FormControl<LocaleEnum | null> = new FormControl<LocaleEnum | null>(null);
  get outputLanguage(): LocaleEnum | null { return this._outputLanguage; }
  @Input() set outputLanguage(value: LocaleEnum | null) { this.setOutputLanguage(value); }
  setOutputLanguage(value: LocaleEnum | null, options?: {emitFormControlEvent?: boolean, emitChangeEvent?: boolean}) {
    this._outputLanguage = value;
    this.outputLanguageFormControl.setValue(value, {emitEvent: options?.emitFormControlEvent ?? true});
    if(options?.emitChangeEvent ?? true) { this.outputLanguageChange.emit(value); }
    this.router.navigate(['.'], { relativeTo: this.route, queryParams: { outputLanguage: value}, queryParamsHandling: 'merge' });
  }
  @Output() outputLanguageChange = new EventEmitter<LocaleEnum | null>();
  // </editor-fold>

  // <editor-fold desc="Shared Context">
  private _sharedContext: string | null = null;
  public sharedContextFormControl: FormControl<string | null> = new FormControl<string | null>(null); // Assuming there's a form control
  get sharedContext(): string | null { return this._sharedContext; }
  @Input() set sharedContext(value: string | null) { this.setSharedContext(value); }
  setSharedContext(value: string | null, options?: {emitFormControlEvent?: boolean, emitChangeEvent?: boolean}) {
    this._sharedContext = value;
    this.sharedContextFormControl.setValue(value, {emitEvent: options?.emitFormControlEvent ?? true});
    if(options?.emitChangeEvent ?? true) { this.sharedContextChange.emit(value); }
    this.router.navigate(['.'], { relativeTo: this.route, queryParams: { sharedContext: value}, queryParamsHandling: 'merge' });
  }
  @Output() sharedContextChange = new EventEmitter<string | null>();
  // </editor-fold>

  // <editor-fold desc="Use Streaming">
  private _useStreaming: boolean = true;
  public useStreamingFormControl: FormControl<boolean | null> = new FormControl<boolean | null>(true);
  get useStreaming(): boolean { return this._useStreaming; }
  @Input() set useStreaming(value: boolean) { this.setUseStreaming(value); }
  setUseStreaming(value: boolean, options?: {emitFormControlEvent?: boolean, emitChangeEvent?: boolean}) {
    this._useStreaming = value;
    this.useStreamingFormControl.setValue(value, {emitEvent: options?.emitFormControlEvent ?? true});
    if(options?.emitChangeEvent ?? true) { this.useStreamingChange.emit(value); }
    this.router.navigate(['.'], { relativeTo: this.route, queryParams: { useStreaming: value}, queryParamsHandling: 'merge' });
  }
  @Output() useStreamingChange = new EventEmitter<boolean>();
  // </editor-fold>

  public outputChunks: string[] = [];
  @Output() outputChunksChange = new EventEmitter<string[]>();

  public executionPerformance = {
    firstResponseTime: 0, totalTime: 0, firstResponseNumberOfWords: 0, totalNumberOfWords: 0,
  }
  @Output() executionPerformanceChange = new EventEmitter<typeof this.executionPerformance>();
  private _startTime = 0;
  private _firstResponseTime = 0;
  // End of BaseWritingAssistanceApiComponent properties

  // <editor-fold desc="Type">
  private _type: SummarizerTypeEnum | null = SummarizerTypeEnum.Headline;
  public typeFormControl: FormControl<SummarizerTypeEnum | null> = new FormControl<SummarizerTypeEnum | null>(SummarizerTypeEnum.Headline);

  get type(): SummarizerTypeEnum | null {
    return this._type;
  }

  @Input()
  set type(value: SummarizerTypeEnum | null) {
   this.setType(value);
  }

  setType(value: SummarizerTypeEnum | null, options?: {emitFormControlEvent?: boolean, emitChangeEvent?: boolean}) {
    this._type = value;
    this.typeFormControl.setValue(value, {emitEvent: options?.emitFormControlEvent ?? true});
    if(options?.emitChangeEvent ?? true) {
      this.typeChange.emit(value);
    }

    this.router.navigate(['.'], { relativeTo: this.route, queryParams: { summarizerType: value}, queryParamsHandling: 'merge' });
  }

  @Output()
  typeChange = new EventEmitter<SummarizerTypeEnum | null>();
  // </editor-fold>

  // <editor-fold desc="Format">
  private _format: SummarizerFormatEnum | null = SummarizerFormatEnum.PlainText;
  public formatFormControl: FormControl<SummarizerFormatEnum | null> = new FormControl<SummarizerFormatEnum | null>(SummarizerFormatEnum.PlainText);

  get format(): SummarizerFormatEnum | null {
    return this._format;
  }

  @Input()
  set format(value: SummarizerFormatEnum | null) {
    this.setFormat(value);
  }

  setFormat(value: SummarizerFormatEnum | null, options?: {emitFormControlEvent?: boolean, emitChangeEvent?: boolean}) {
    this._format = value;
    this.formatFormControl.setValue(value, {emitEvent: options?.emitFormControlEvent ?? true});
    if(options?.emitChangeEvent ?? true) {
      this.formatChange.emit(value);
    }

    this.router.navigate(['.'], { relativeTo: this.route, queryParams: { summarizerFormat: value}, queryParamsHandling: 'merge' });
  }

  @Output()
  formatChange = new EventEmitter<SummarizerFormatEnum | null>();
  // </editor-fold>

  // <editor-fold desc="Length">
  private _length: SummarizerLengthEnum | null = SummarizerLengthEnum.Medium;
  public lengthFormControl: FormControl<SummarizerLengthEnum | null> = new FormControl<SummarizerLengthEnum | null>(SummarizerLengthEnum.Medium);

  get length(): SummarizerLengthEnum | null {
    return this._length;
  }

  @Input()
  set length(value: SummarizerLengthEnum | null) {
    this.setLength(value);
  }

  setLength(value: SummarizerLengthEnum | null, options?: {emitFormControlEvent?: boolean, emitChangeEvent?: boolean}) {
    this._length = value;
    this.lengthFormControl.setValue(value, {emitEvent: options?.emitFormControlEvent ?? true});
    if(options?.emitChangeEvent ?? true) {
      this.lengthChange.emit(value);
    }

    this.router.navigate(['.'], { relativeTo: this.route, queryParams: { summarizerLength: value}, queryParamsHandling: 'merge' });
  }

  @Output()
  lengthChange = new EventEmitter<SummarizerLengthEnum | null>();
  // </editor-fold>

  protected outputStatusMessage: string = ""; // Keep

  // Override apiFlag from BasePageComponent
  public override apiFlag: RequirementInterface = {
    status: RequirementStatus.Pending,
    message: 'Pending',
    contentHtml: `Activate <span class="code">chrome://flags/#summarization-api-for-gemini-nano</span>`
  };
  // getRequirement() removed.

  // Keep availabilityStatus and availabilityError for specific check logic
  public availabilityStatus: AvailabilityStatusEnum = AvailabilityStatusEnum.Unknown;
  public availabilityError?: Error;

  get checkAvailabilityCode() {
    return `Summarizer.availability({
  type: '${this.typeFormControl.value}',
  format: '${this.formatFormControl.value}',
  length: '${this.lengthFormControl.value}',
  expectedInputLanguages: ${JSON.stringify(this.expectedInputLanguagesFormControl.value)},
  expectedContextLanguages: ${JSON.stringify(this.expectedContextLanguagesFormControl.value)},
  outputLanguage: '${this.outputLanguageFormControl.value}',
})`
  }

  get summarizeCode() {
    if(this.useStreamingFormControl.value) {
      return `const abortController = new AbortController();

const summarizer = await Summarizer.create({
  type: '${this.typeFormControl.value}',
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

const stream: ReadableStream = summarizer.summarizeStreaming('${this.input}', {context: '${this.contextFormControl.value}'});

for await (const chunk of stream) {
  // Do something with each 'chunk'
  this.summarizerOutput += chunk;
}`;
    } else {
      return `const abortController = new AbortController();

const summarizer = await Summarizer.create({
  type: '${this.typeFormControl.value}',
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

await summarizer.summarize('${this.input}', {context: '${this.contextFormControl.value}'})`;
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
    this.outputCollapsed = true; // Set desired initial state
    this.titleService.setTitle('Summarizer API | AI Playground'); // Set page title

    this.checkRequirements(); // Call implemented abstract method

    this.subscriptions.push(this.route.queryParams.subscribe((params) => {
      if (params['summarizerType']) {
        this.typeFormControl.setValue(params['summarizerType']);
      }

      if (params['summarizerFormat']) {
        this.formatFormControl.setValue(params['summarizerFormat']);
      }

      if (params['summarizerLength']) {
        this.lengthFormControl.setValue(params['summarizerLength']);
      }
    }));


    // Register form changes events
    this.subscriptions.push(this.typeFormControl.valueChanges.subscribe((value) => {
      this.setType(value, {emitChangeEvent: true, emitFormControlEvent: false});
    }));
    this.subscriptions.push(this.formatFormControl.valueChanges.subscribe((value) => {
      this.setFormat(value, {emitChangeEvent: true, emitFormControlEvent: false});
    }));
    this.subscriptions.push(this.lengthFormControl.valueChanges.subscribe((value) => {
      this.setLength(value);
    }));
  }

  // getRequirement() removed as apiFlag is now directly defined.

  // Implementation of abstract method
  override checkRequirements(): void {
    if (isPlatformBrowser(this.platformId) && (!this.window || !("Summarizer" in this.window))) {
      this.apiFlag.status = RequirementStatus.Fail; // Use overridden apiFlag
      this.apiFlag.message = "'Summarizer' is not defined. Activate the flag.";
    } else if(isPlatformBrowser(this.platformId)) {
      this.apiFlag.status = RequirementStatus.Pass;
      this.apiFlag.message = "Passed";
    }
  }

  // Implementation of abstract method
  override async checkAvailability(): Promise<void> {
    try {
      // @ts-ignore Summarizer is a global
      this.availabilityStatus = await Summarizer.availability({
        type: this.typeFormControl.value,
        format: this.formatFormControl.value,
        length: this.lengthFormControl.value,
        expectedInputLanguages: this.expectedInputLanguagesFormControl.value,
        expectedContextLanguages: this.expectedContextLanguagesFormControl.value,
        outputLanguage: this.outputLanguageFormControl.value
      });
    } catch (e: any) {
      this.availabilityStatus = AvailabilityStatusEnum.Unavailable;
      // this.errorChange.emit(e); // errorChange is not in BasePageComponent
      this.availabilityError = e; // Keep local availabilityError
      this.error = e; // Set inherited error
    }
  }

  // Methods for execution performance (kept from BaseWritingAssistanceApiComponent)
  protected emitExecutionPerformanceChange() {
    this.executionPerformanceChange.emit(this.executionPerformance);
  }
  protected startExecutionTime() {
    this._startTime = performance.now();
    this._firstResponseTime = 0;
    this.executionPerformance.firstResponseTime = 0;
    this.executionPerformance.totalTime = 0;
    this.emitExecutionPerformanceChange();
  }
  protected lapFirstResponseTime() {
    if (this._firstResponseTime === 0) {
      this._firstResponseTime = performance.now();
      this.executionPerformance.firstResponseTime = this._firstResponseTime - this._startTime;
      this.emitExecutionPerformanceChange();
    }
  }
  protected stopExecutionTime() {
    if (this._startTime !== 0) {
      this.executionPerformance.totalTime = performance.now() - this._startTime;
      this._startTime = 0;
      this.emitExecutionPerformanceChange();
    }
  }

  async summarize() {
    this.status = TaskStatus.Executing; // Use inherited status
    this.outputCollapsed = false; // Use inherited outputCollapsed
    this.outputStatusMessage = "Preparing and downloading model...";
    this.outputChunks = []; // Local property
    this.error = undefined; // Inherited property
    this.outputChunksChange.emit(this.outputChunks); // Local EventEmitter
    this.output = ""; // Inherited property
    this.outputStatusMessage = "Running query...";
    this.loaded = 0; // Inherited property

    try {
      // const self = this; // May not be needed
      // Re-initialize inherited controllers
      this.abortController = new AbortController();
      this.abortControllerFromCreate  = new AbortController();

      // @ts-ignore
      const summarizer = await Summarizer.create({
        type: this.typeFormControl.value,
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
        const stream: ReadableStream = summarizer.summarizeStreaming(this.input, {context: this.contextFormControl.value, signal: this.abortController.signal});

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
        const output = await summarizer.summarize(this.input, {context: this.contextFormControl.value, signal: this.abortController.signal});
        this.executionPerformance.totalNumberOfWords = TextUtils.countWords(output);
        this.emitExecutionPerformanceChange();

        this.output = output;
      }

      this.status = TaskStatus.Completed; // Inherited status
    } catch (e: any) {
      this.status = TaskStatus.Error; // Inherited status
      this.outputStatusMessage = `Error: ${e}`;
      // this.errorChange.emit(e); // errorChange not in BasePageComponent
      this.error = e; // Inherited error
    } finally {
      this.stopExecutionTime();
    }

  }

  SummarizerTypeEnum = SummarizerTypeEnum;
  SummarizerFormatEnum = SummarizerFormatEnum;
  SummarizerLengthEnum = SummarizerLengthEnum;
  protected readonly LocaleEnum = LocaleEnum;
}
