import {Component, EventEmitter, Inject, Input, OnInit, Output, PLATFORM_ID} from '@angular/core';
import {TaskStatus} from '../../../enums/task-status.enum';
import {RequirementStatus} from '../../../enums/requirement-status.enum';
import {DOCUMENT, isPlatformBrowser} from '@angular/common';
import {FormControl} from '@angular/forms';
import {
  BaseWritingAssistanceApiComponent
} from '../../../components/base-writing-assistance-api/base-writing-assistance-api.component';
import {AvailabilityStatusEnum} from '../../../enums/availability-status.enum';
import {SummarizerTypeEnum} from '../../../enums/summarizer-type.enum';
import {SummarizerFormatEnum} from '../../../enums/summarizer-format.enum';
import {SummarizerLengthEnum} from '../../../enums/summarizer-length.enum';
import {ActivatedRoute, Router} from '@angular/router';
import {RequirementInterface} from '../../../interfaces/requirement.interface';
import {Title} from '@angular/platform-browser';
import {ExecutionPerformanceManager} from '../../../managers/execution-performance.manager';
import {BuiltInAiApiEnum} from '../../../enums/built-in-ai-api.enum';


@Component({
  selector: 'app-summarizer-batch',
  templateUrl: './summarizer-batch-api.component.html',
  standalone: false,
  styleUrl: './summarizer-batch-api.component.scss'
})
export class SummarizerBatchApiComponent extends BaseWritingAssistanceApiComponent implements OnInit {

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

  // Batch specific properties
  public results: Array<{input: string, summary: string}> = []; // To store pairs of input and summary
  public override inputFormControl = new FormControl<string>(''); // Keep existing input form control for now, might change based on UX for batch

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

  // TODO: Adapt summarizeCode for batch processing if needed for display, or remove if not applicable.
  // For now, it will reflect a single item summarization.
  get summarizeCode() {
    const inputs = this.inputFormControl.value?.split('\n').filter(input => input.trim() !== '') || ['']; // Simple split by newline for batch
    const firstInput = inputs[0]; // Example: show code for the first input

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

// Example for one input; loop for batch
const stream: ReadableStream = summarizer.summarizeStreaming('${firstInput}', {context: '${this.contextFormControl.value}'});

let output = "";
for await (const chunk of stream) {
  // Do something with each 'chunk'
  output += chunk;
}

// See the complete response here
console.log(output);`;
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

// Example for one input; loop for batch
const output = await summarizer.summarize('${firstInput}', {context: '${this.contextFormControl.value}'})

// See the complete response here
console.log(output);`;
    }
  }

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(DOCUMENT) document: Document,
    router: Router,
    route: ActivatedRoute,
    title: Title,
    private readonly executionPerformanceManager: ExecutionPerformanceManager,
  ) {
    super(document, router, route, title);
  }


  override ngOnInit() {
    super.ngOnInit();

    this.checkRequirements()
    this.executionPerformanceManager.reset();

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

  getRequirement(): RequirementInterface {
    return {
      ...this.apiFlag,
      contentHtml: `Activate <span class="code">chrome://flags/#summarization-api-for-gemini-nano</span>`,
    }
  }

  checkRequirements() {
    if (isPlatformBrowser(this.platformId) && (!this.window || !("Summarizer" in this.window))) {
      this.apiFlag.status = RequirementStatus.Fail;
      this.apiFlag.message = "'Summarizer' is not defined. Activate the flag.";
    } else if(isPlatformBrowser(this.platformId)) {
      this.apiFlag.status = RequirementStatus.Pass;
      this.apiFlag.message = "Passed";
    }
  }

  async checkAvailability() {
    try {
      // @ts-ignore
      this.availabilityStatus = await Summarizer.availability({
        type: this.typeFormControl.value,
        format: this.formatFormControl.value,
        length: this.lengthFormControl.value,
        expectedInputLanguages: this.expectedInputLanguagesFormControl.value,
        expectedContextLanguages: this.expectedContextLanguagesFormControl.value,
        outputLanguage: this.outputLanguageFormControl.value
      })
    } catch (e: any) {
      this.availabilityStatus = AvailabilityStatusEnum.Unavailable
      this.errorChange.emit(e);
      this.availabilityError = e;
    }
  }

  async summarize() {
    this.status = TaskStatus.Executing;
    this.outputCollapsed = false;
    this.outputStatusMessage = "Preparing and downloading model...";
    this.results = []; // Reset results for batch
    this.error = undefined;
    // this.outputChunksChange.emit(this.outputChunks); // TODO: How to handle chunks for batch?
    this.output = ""; // Clear single output, using results array now
    this.outputStatusMessage = "Running query...";
    this.loaded = 0;
    this.executionPerformanceManager.start(BuiltInAiApiEnum.Summarizer) // TODO: Change to SummarizerBatch if new enum value

    const inputs = this.inputFormControl.value?.split('\n').filter(input => input.trim() !== '') || [];
    if (inputs.length === 0) {
      this.status = TaskStatus.Error;
      this.outputStatusMessage = "Error: No inputs provided for summarization.";
      this.error = new Error("No inputs provided.");
      this.errorChange.emit(this.error);
      return;
    }

    try {
      const self = this;
      this.abortControllerFromCreate  = new AbortController();
      this.abortController = new AbortController();

      this.executionPerformanceManager.sessionCreationStarted({
        type: this.typeFormControl.value,
        format: this.formatFormControl.value,
        length: this.lengthFormControl.value,
        sharedContext: this.sharedContext,
        expectedInputLanguages: this.expectedInputLanguagesFormControl.value,
        expectedContextLanguages: this.expectedContextLanguagesFormControl.value,
        outputLanguage: this.outputLanguageFormControl.value
      });

      // @ts-expect-error
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
            self.executionPerformanceManager.downloadUpdated(e.loaded)
          });
        },
        signal: this.abortControllerFromCreate.signal,
      });
      this.executionPerformanceManager.sessionCreationCompleted()

      for (const singleInput of inputs) {
        if (this.abortController.signal.aborted || this.abortControllerFromCreate.signal.aborted) {
          this.outputStatusMessage = "Execution aborted.";
          break;
        }

        this.executionPerformanceManager.inferenceStarted({streaming: this.useStreamingFormControl.value, input: singleInput, context: this.contextFormControl.value});
        let currentOutput = "";
        if(this.useStreamingFormControl.value) {
          // TODO: Streaming for batch needs careful consideration on how to display.
          // For now, concatenate results.
          const stream: ReadableStream = summarizer.summarizeStreaming(singleInput, {context: this.contextFormControl.value, signal: this.abortController.signal});
          for await (const chunk of stream) {
            this.executionPerformanceManager.tokenReceived();
            currentOutput += chunk;
          }
        } else {
          currentOutput = await summarizer.summarize(singleInput, {context: this.contextFormControl.value, signal: this.abortController.signal});
          this.executionPerformanceManager.tokenReceived();
        }
        this.results.push({input: singleInput, summary: currentOutput});
        // Update combined output for app-output component (optional, if table is primary)
        this.output = this.results.map(r => `Input:\n${r.input}\n\nSummary:\n${r.summary}`).join('\n\n---\n\n');
        this.executionPerformanceManager.inferenceCompleted();
      }

      if (this.abortController.signal.aborted || this.abortControllerFromCreate.signal.aborted) {
          this.status = TaskStatus.Error;
          this.outputStatusMessage = "Execution aborted by user.";
      } else {
          this.status = TaskStatus.Completed;
      }

    } catch (e: any) {
      this.status = TaskStatus.Error;
      this.outputStatusMessage = `Error: ${e}`;
      this.errorChange.emit(e);
      this.error = e;
      // Ensure session creation completed is called in case of error during creation
      this.executionPerformanceManager.sessionCreationCompleted();
      this.executionPerformanceManager.inferenceCompleted(); // Mark inference as completed on error
    }
    // Removed finally block as inferenceCompleted is called within loop/error handling
  }

  SummarizerTypeEnum = SummarizerTypeEnum;
  SummarizerFormatEnum = SummarizerFormatEnum;
  SummarizerLengthEnum = SummarizerLengthEnum;
}
