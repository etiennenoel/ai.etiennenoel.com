import {Component, EventEmitter, Inject, Input, OnInit, Output, PLATFORM_ID} from '@angular/core'; // PLATFORM_ID for constructor
// TaskStatus, RequirementStatus, isPlatformBrowser, RequirementInterface, SearchSelectDropdownOptionsInterface removed
import {DOCUMENT} from '@angular/common';
import {FormControl} from '@angular/forms';
import {WriterToneEnum} from '../../enums/writer-tone.enum'; // Keep for template/logic
import {WriterFormatEnum} from '../../enums/writer-format.enum'; // Keep for template/logic
import {WriterLengthEnum} from '../../enums/writer-length.enum'; // Keep for template/logic
import {BaseWritingAssistanceApiComponent} from '../../components/base-writing-assistance-api/base-writing-assistance-api.component';
import {TextUtils} from '../../utils/text.utils'; // Keep for execute method
import {AvailabilityStatusEnum} from '../../enums/availability-status.enum'; // Keep if directly used in template
import {LocaleEnum} from '../../enums/locale.enum'; // Keep for template/logic
import {ActivatedRoute, Router} from '@angular/router';
import {Title} from '@angular/platform-browser';
// TaskStatus might be needed if used in template for status comparison
import {TaskStatus} from '../../enums/task-status.enum';


@Component({
  selector: 'app-writer',
  templateUrl: './writer-api.component.html',
  standalone: false,
  styleUrl: './writer-api.component.scss'
})
export class WriterApiComponent extends BaseWritingAssistanceApiComponent implements OnInit {
  // Implement abstract members from BaseApiPageComponent
  public apiName = 'Writer';
  public apiFlagName = 'chrome://flags/#writer-api-for-gemini-nano';

  // <editor-fold desc="Tone">
  private _tone: WriterToneEnum | null = WriterToneEnum.Neutral;
  public toneFormControl: FormControl<WriterToneEnum | null> = new FormControl<WriterToneEnum | null>(WriterToneEnum.Neutral);

  get tone(): WriterToneEnum | null {
    return this._tone;
  }

  @Input()
  set tone(value: WriterToneEnum | null) {
   this.setTone(value);
  }

  setTone(value: WriterToneEnum | null, options?: {emitFormControlEvent?: boolean, emitChangeEvent?: boolean}) {
    this._tone = value;
    this.toneFormControl.setValue(value, {emitEvent: options?.emitFormControlEvent ?? true});
    if(options?.emitChangeEvent ?? true) {
      this.toneChange.emit(value);
    }
    this.router.navigate(['.'], { relativeTo: this.route, queryParams: { writerTone: value}, queryParamsHandling: 'merge' });
  }

  @Output()
  toneChange = new EventEmitter<WriterToneEnum | null>();
  // </editor-fold>

  // <editor-fold desc="Format">
  private _format: WriterFormatEnum | null = WriterFormatEnum.PlainText;
  public formatFormControl: FormControl<WriterFormatEnum | null> = new FormControl<WriterFormatEnum | null>(WriterFormatEnum.PlainText);

  get format(): WriterFormatEnum | null {
    return this._format;
  }

  @Input()
  set format(value: WriterFormatEnum | null) {
    this.setFormat(value);
  }

  setFormat(value: WriterFormatEnum | null, options?: {emitFormControlEvent?: boolean, emitChangeEvent?: boolean}) {
    this._format = value;
    this.formatFormControl.setValue(value, {emitEvent: options?.emitFormControlEvent ?? true});
    if(options?.emitChangeEvent ?? true) {
      this.formatChange.emit(value);
    }
    this.router.navigate(['.'], { relativeTo: this.route, queryParams: { writerFormat: value}, queryParamsHandling: 'merge' });
  }

  @Output()
  formatChange = new EventEmitter<WriterFormatEnum | null>();
  // </editor-fold>

  // <editor-fold desc="Length">
  private _length: WriterLengthEnum | null = WriterLengthEnum.Medium;
  public lengthFormControl: FormControl<WriterLengthEnum | null> = new FormControl<WriterLengthEnum | null>(WriterLengthEnum.Medium);

  get length(): WriterLengthEnum | null {
    return this._length;
  }

  @Input()
  set length(value: WriterLengthEnum | null) {
    this.setLength(value);
  }

  setLength(value: WriterLengthEnum | null, options?: {emitFormControlEvent?: boolean, emitChangeEvent?: boolean}) {
    this._length = value;
    this.lengthFormControl.setValue(value, {emitEvent: options?.emitFormControlEvent ?? true});
    if(options?.emitChangeEvent ?? true) {
      this.lengthChange.emit(value);
    }
    this.router.navigate(['.'], { relativeTo: this.route, queryParams: { writerLength: value}, queryParamsHandling: 'merge' });
  }

  @Output()
  lengthChange = new EventEmitter<WriterLengthEnum | null>();
  // </editor-fold>

  protected outputStatusMessage: string = ""; // Retained

  // apiFlagContentHtml removed
  // getRequirement() removed

  // checkAvailabilityCode getter remains (implements abstract member from BaseApiPageComponent)
  get checkAvailabilityCode() {
    return `Writer.availability({
  tone: '${this.toneFormControl.value}',
  format: '${this.formatFormControl.value}',
  length: '${this.lengthFormControl.value}',
  expectedInputLanguages: ${JSON.stringify(this.expectedInputLanguagesFormControl.value)},
  expectedContextLanguages: ${JSON.stringify(this.expectedContextLanguagesFormControl.value)},
  outputLanguage: '${this.outputLanguageFormControl.value}',
})`;
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

  // Renamed from writeCode to executeCode (implements abstract member from BaseApiPageComponent)
  get executeCode() {
    if(this.useStreamingFormControl.value) {
      return `const abortController = new AbortController(); // Consider using this.abortController

const writer = await Writer.create({
  tone: '${this.toneFormControl.value}',
  format: '${this.formatFormControl.value}',
  length: '${this.lengthFormControl.value}',
  sharedContext: '${this.sharedContextFormControl.value}',
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

const stream: ReadableStream = writer.writeStreaming('${this.inputFormControl.value}', {context: '${this.contextFormControl.value}'}); // this.inputFormControl from BaseWritingAssistanceApiComponent

for await (const chunk of stream) {
  // Do something with each 'chunk'
  // this.writerOutput += chunk; // Ensure this.output is used correctly from base class
  this.output += chunk; // Assuming this.output is the correct inherited property
}`;
    } else {
      return `const abortController = new AbortController();

const writer = await Writer.create({
  tone: '${this.toneFormControl.value}',
  format: '${this.formatFormControl.value}',
  length: '${this.lengthFormControl.value}',
  sharedContext: '${this.sharedContextFormControl.value}',
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

await writer.write('${this.inputFormControl.value}', {context: '${this.contextFormControl.value}'})`; // this.inputFormControl from BaseWritingAssistanceApiComponent
    }
  }


  override ngOnInit() {
    super.ngOnInit(); // This will call BaseApiPageComponent.ngOnInit which calls this.checkRequirements()

    // this.checkRequirements() // Removed from here

    this.subscriptions.push(this.route.queryParams.subscribe((params) => {
      if (params['writerTone']) {
        this.toneFormControl.setValue(params['writerTone']);
      }

      if (params['writerFormat']) {
        this.formatFormControl.setValue(params['writerFormat']);
      }

      if (params['writerLength']) {
        this.lengthFormControl.setValue(params['writerLength']);
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
      this.setLength(value, {emitChangeEvent: true, emitFormControlEvent: false}); // Assuming setLength correctly updates router queryParams
    }));
  }

  // checkRequirements() method removed

  // checkAvailability method remains (implements abstract member from BaseApiPageComponent)
  // It already updates this.availabilityStatus and this.availabilityError (inherited)
  async checkAvailability() { // No Promise<void> needed as it's not overriding a strict signature here but matches BaseApiPageComponent
    this.availabilityError = undefined; // Clear previous error
    // this.errorChange.emit(undefined); // If errorChange is still used, ensure it's from base
    try {
      // @ts-expect-error Writer might not be on window directly
      this.availabilityStatus = await window.Writer.availability({
        tone: this.toneFormControl.value,
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

  // Renamed from write to execute (implements abstract member from BaseApiPageComponent)
  async execute() {
    this.status = TaskStatus.Executing; // Uses inherited status
    this.outputCollapsed = false; // Uses inherited outputCollapsed
    this.outputStatusMessage = "Preparing and downloading model...";
    this.loaded = 0; // Uses inherited loaded
    this.outputChunks = []; // Uses inherited outputChunks
    // this.outputChunksChange.emit(this.outputChunks); // Uses inherited outputChunksChange
    this.output = ""; // Uses inherited output
    this.error = undefined; // Uses inherited error
    this.outputStatusMessage = "Running query...";

    try {
      const self = this;
      // Abort controllers are inherited: this.abortControllerFromCreate, this.abortController
      // this.abortControllerFromCreate  = new AbortController(); // Remove, use inherited
      // this.abortController = new AbortController(); // Remove, use inherited

      // @ts-expect-error Writer might not be on window directly
      const writer = await window.Writer.create({
        tone: this.toneFormControl.value,
        format: this.formatFormControl.value,
        length: this.lengthFormControl.value,
        sharedContext: this.sharedContextFormControl.value,
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
        // this.abortController = new AbortController(); // Use inherited abortController
        const stream: ReadableStream = writer.writeStreaming(this.input, {context: this.contextFormControl.value, signal: this.abortController?.signal}); // Use inherited abortController

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
        const writerOutput = await writer.write(this.input, {context: this.contextFormControl.value, signal: this.abortController?.signal}); // Use inherited abortController
        this.executionPerformance.totalNumberOfWords = TextUtils.countWords(writerOutput);
        this.emitExecutionPerformanceChange();

        this.output = writerOutput; // Uses inherited output
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

  WriterToneEnum = WriterToneEnum;
  WriterFormatEnum = WriterFormatEnum;
  WriterLengthEnum = WriterLengthEnum;
  protected readonly LocaleEnum = LocaleEnum;
}
