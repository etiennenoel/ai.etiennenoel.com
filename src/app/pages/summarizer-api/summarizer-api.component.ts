import {Component, EventEmitter, Inject, Input, OnInit, Output, PLATFORM_ID} from '@angular/core'; // PLATFORM_ID for constructor
// TaskStatus, RequirementStatus, isPlatformBrowser, TextUtils, SearchSelectDropdownOptionsInterface, RequirementInterface are not directly used here anymore or handled by base classes
import {DOCUMENT} from '@angular/common';
import {FormControl} from '@angular/forms';
import {BaseWritingAssistanceApiComponent} from '../../components/base-writing-assistance-api/base-writing-assistance-api.component';
import {AvailabilityStatusEnum} from '../../enums/availability-status.enum'; // Keep if directly used in template
import {LocaleEnum} from '../../enums/locale.enum'; // Keep for template/logic
import {SummarizerTypeEnum} from '../../enums/summarizer-type.enum'; // Keep for template/logic
import {SummarizerFormatEnum} from '../../enums/summarizer-format.enum'; // Keep for template/logic
import {SummarizerLengthEnum} from '../../enums/summarizer-length.enum'; // Keep for template/logic
import {ActivatedRoute, Router} from '@angular/router';
import {Title} from '@angular/platform-browser';
// TaskStatus might be needed if used in template for status comparison
import {TaskStatus} from '../../enums/task-status.enum';
import {TextUtils} from '../../utils/text.utils'; // Keep for execute method

@Component({
  selector: 'app-summarizer',
  templateUrl: './summarizer-api.component.html',
  standalone: false,
  styleUrl: './summarizer-api.component.scss'
})
export class SummarizerApiComponent extends BaseWritingAssistanceApiComponent implements OnInit {
  // Implement abstract members from BaseApiPageComponent
  public apiName = 'Summarizer';
  public apiFlagName = 'chrome://flags/#summarization-api-for-gemini-nano';

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

  protected outputStatusMessage: string = ""; // Retained

  // checkAvailabilityCode getter remains (implements abstract member from BaseApiPageComponent)
  get checkAvailabilityCode() {
    return `Summarizer.availability({
  type: '${this.typeFormControl.value}',
  format: '${this.formatFormControl.value}',
  length: '${this.lengthFormControl.value}',
  expectedInputLanguages: ${JSON.stringify(this.expectedInputLanguagesFormControl.value)},
  expectedContextLanguages: ${JSON.stringify(this.expectedContextLanguagesFormControl.value)},
  outputLanguage: '${this.outputLanguageFormControl.value}',
})`;
  }

  // Renamed from summarizeCode to executeCode (implements abstract member from BaseApiPageComponent)
  get executeCode() {
    if(this.useStreamingFormControl.value) {
      return `const abortController = new AbortController(); // Consider using this.abortController

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
  signal: abortController.signal, // Consider using this.abortController.signal
})

const stream: ReadableStream = summarizer.summarizeStreaming('${this.input}', {context: '${this.contextFormControl.value}'}); // this.input from BaseWritingAssistanceApiComponent

for await (const chunk of stream) {
  // Do something with each 'chunk'
  // this.summarizerOutput += chunk; // Ensure this.output is used correctly from base class
  this.output += chunk; // Assuming this.output is the correct inherited property
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
  signal: abortController.signal, // Consider using this.abortController.signal
})

await summarizer.summarize('${this.input}', {context: '${this.contextFormControl.value}'})`; // this.input from BaseWritingAssistanceApiComponent
    }
  }

  constructor(
    @Inject(DOCUMENT) document: Document, // platformId removed from here
    @Inject(PLATFORM_ID) platformId: Object, // Added platformId for super
    router: Router,
    route: ActivatedRoute,
    titleService: Title, // Renamed from title to titleService
  ) {
    super(document, platformId, router, route, titleService); // Updated super call
  }


  override ngOnInit() {
    super.ngOnInit(); // This will call BaseApiPageComponent.ngOnInit which calls this.checkRequirements()

    // this.checkRequirements() // Removed from here

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
      this.setLength(value); // Assuming setLength correctly updates router queryParams
    }));
  }

  // getRequirement() method removed
  // checkRequirements() method removed

  // checkAvailability method remains (implements abstract member from BaseApiPageComponent)
  // It already updates this.availabilityStatus and this.availabilityError (inherited)
  async checkAvailability() { // No Promise<void> needed as it's not overriding a strict signature here but matches BaseApiPageComponent
    this.availabilityError = undefined; // Clear previous error
    // this.errorChange.emit(undefined); // If errorChange is still used, ensure it's from base
    try {
      // @ts-expect-error Summarizer might not be on window directly
      this.availabilityStatus = await window.Summarizer.availability({
        type: this.typeFormControl.value,
        format: this.formatFormControl.value,
        length: this.lengthFormControl.value,
        expectedInputLanguages: this.expectedInputLanguagesFormControl.value,
        expectedContextLanguages: this.expectedContextLanguagesFormControl.value,
        outputLanguage: this.outputLanguageFormControl.value
      });
    } catch (e: any) {
      this.availabilityStatus = AvailabilityStatusEnum.Unavailable;
      this.availabilityError = e;
      // this.errorChange.emit(e); // If errorChange is still used
    }
  }

  // Renamed from summarize to execute (implements abstract member from BaseApiPageComponent)
  async execute() {
    this.status = TaskStatus.Executing; // Uses inherited status
    this.outputCollapsed = false; // Uses inherited outputCollapsed
    this.outputStatusMessage = "Preparing and downloading model...";
    this.outputChunks = []; // Uses inherited outputChunks
    this.error = undefined; // Uses inherited error
    // this.outputChunksChange.emit(this.outputChunks); // Uses inherited outputChunksChange
    this.output = ""; // Uses inherited output
    this.outputStatusMessage = "Running query...";
    this.loaded = 0; // Uses inherited loaded

    try {
      const self = this;
      // Abort controllers are inherited: this.abortControllerFromCreate, this.abortController
      // this.abortControllerFromCreate  = new AbortController(); // Remove, use inherited
      // this.abortController = new AbortController(); // Remove, use inherited

      // @ts-expect-error Summarizer might not be on window directly
      const summarizer = await window.Summarizer.create({
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
            self.loaded = e.loaded; // Uses inherited loaded
          });
        },
        signal: this.abortControllerFromCreate?.signal, // Use inherited abortControllerFromCreate
      });

      this.startExecutionTime(); // This method is from BaseWritingAssistanceApiComponent

      this.executionPerformance.firstResponseNumberOfWords = 0;
      this.executionPerformance.totalNumberOfWords = 0;
      this.emitExecutionPerformanceChange();

      if(this.useStreamingFormControl.value) { // useStreamingFormControl from BaseWritingAssistanceApiComponent
        const stream: ReadableStream = summarizer.summarizeStreaming(this.input, {context: this.contextFormControl.value, signal: this.abortController?.signal}); // Use inherited abortController

        let hasFirstResponse = false;

        for await (const chunk of stream) {
          if(!hasFirstResponse) {
            hasFirstResponse = true;
            this.lapFirstResponseTime(); // From BaseWritingAssistanceApiComponent
          }

          if(this.executionPerformance.firstResponseNumberOfWords == 0) { // executionPerformance from BaseWritingAssistanceApiComponent
            this.executionPerformance.firstResponseNumberOfWords = TextUtils.countWords(chunk);
          }
          this.executionPerformance.totalNumberOfWords += TextUtils.countWords(chunk);

          this.emitExecutionPerformanceChange(); // From BaseWritingAssistanceApiComponent

          // Do something with each 'chunk'
          this.output += chunk; // Uses inherited output
          this.outputChunks.push(chunk); // Uses inherited outputChunks
          this.outputChunksChange.emit(this.outputChunks); // Uses inherited outputChunksChange
        }

      }
      else {
        const summarizerOutput = await summarizer.summarize(this.input, {context: this.contextFormControl.value, signal: this.abortController?.signal}); // Use inherited abortController
        this.executionPerformance.totalNumberOfWords = TextUtils.countWords(summarizerOutput);
        this.emitExecutionPerformanceChange();

        this.output = summarizerOutput; // Uses inherited output
      }

      this.status = TaskStatus.Completed; // Uses inherited status
    } catch (e: any) {
      this.status = TaskStatus.Error; // Uses inherited status
      this.outputStatusMessage = `Error: ${e}`;
      // this.errorChange.emit(e); // errorChange is from BaseWritingAssistanceApiComponent
      this.error = e; // Uses inherited error
    } finally {
      this.stopExecutionTime(); // From BaseWritingAssistanceApiComponent
    }

  }

  SummarizerTypeEnum = SummarizerTypeEnum;
  SummarizerFormatEnum = SummarizerFormatEnum;
  SummarizerLengthEnum = SummarizerLengthEnum;
  protected readonly LocaleEnum = LocaleEnum;
}
