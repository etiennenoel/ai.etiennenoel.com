import {Component, EventEmitter, Inject, Input, OnInit, Output, PLATFORM_ID} from '@angular/core'; // PLATFORM_ID needed for constructor
import {DOCUMENT} from '@angular/common';
import {TextUtils} from '../../utils/text.utils'; // Added TextUtils import back
import {FormControl} from '@angular/forms';
import {BaseWritingAssistanceApiComponent} from '../../components/base-writing-assistance-api/base-writing-assistance-api.component';
import {AvailabilityStatusEnum} from '../../enums/availability-status.enum'; // Keep if directly used in template, else remove
import {LocaleEnum} from '../../enums/locale.enum'; // Keep for template/logic
import {RewriterLengthEnum} from '../../enums/rewriter-length.enum'; // Keep for template/logic
import {RewriterFormatEnum} from '../../enums/rewriter-format.enum'; // Keep for template/logic
import {RewriterToneEnum} from '../../enums/rewriter-tone.enum'; // Keep for template/logic
import {ActivatedRoute, Router} from '@angular/router';
import {Title} from '@angular/platform-browser';
// TaskStatus might be needed if used in template for status comparison
import {TaskStatus} from '../../enums/task-status.enum';


@Component({
  selector: 'app-rewriter',
  templateUrl: './rewriter-api.component.html',
  standalone: false,
  styleUrl: './rewriter-api.component.scss'
})
export class RewriterApiComponent extends BaseWritingAssistanceApiComponent implements OnInit {
  // Implement abstract members from BaseApiPageComponent
  public apiName = 'Rewriter';
  public apiFlagName = 'chrome://flags/#rewriter-api-for-gemini-nano';

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

  protected outputStatusMessage: string = "";
  // apiFlagContentHtml removed
  // getRequirement() removed

  // checkAvailabilityCode getter remains (implements abstract member from BaseApiPageComponent)
  get checkAvailabilityCode() {
    return `Rewriter.availability({
  tone: '${this.toneFormControl.value}',
  format: '${this.formatFormControl.value}',
  length: '${this.lengthFormControl.value}',
  expectedInputLanguages: ${JSON.stringify(this.expectedInputLanguagesFormControl.value)},
  expectedContextLanguages: ${JSON.stringify(this.expectedContextLanguagesFormControl.value)},
  outputLanguage: '${this.outputLanguageFormControl.value}',
})`;
  }

  // Renamed from rewriteCode to executeCode (implements abstract member from BaseApiPageComponent)
  get executeCode() {
    if(this.useStreamingFormControl.value) {
      return `const abortController = new AbortController(); // Consider using this.abortController

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
  signal: abortController.signal, // Consider using this.abortController.signal
})

const stream: ReadableStream = rewriter.rewriteStreaming('${this.input}', {context: '${this.contextFormControl.value}'}); // this.input is from BaseWritingAssistanceApiComponent

for await (const chunk of stream) {
  // Do something with each 'chunk'
  // this.rewriterOutput += chunk; // Ensure this.output is used correctly from base class
  this.output += chunk; // Assuming this.output is the correct inherited property
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
  signal: abortController.signal, // Consider using this.abortController.signal
})

await rewriter.rewrite('${this.input}', {context: '${this.contextFormControl.value}'})`; // this.input is from BaseWritingAssistanceApiComponent
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
      this.setLength(value); // Assuming setLength correctly updates router queryParams
    }));
  }

  // checkRequirements() method removed

  // checkAvailability method remains (implements abstract member from BaseApiPageComponent)
  // It already updates this.availabilityStatus and this.availabilityError (inherited)
  async checkAvailability() { // No Promise<void> needed as it's not overriding a strict signature here but matches BaseApiPageComponent
    this.availabilityError = undefined; // Clear previous error
    // this.errorChange.emit(undefined); // If errorChange is still used, ensure it's from base
    try {
      // @ts-expect-error Rewriter might not be on window directly
      this.availabilityStatus = await window.Rewriter.availability({
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

  // Renamed from rewrite to execute (implements abstract member from BaseApiPageComponent)
  async execute() {
    this.status = TaskStatus.Executing; // Uses inherited status
    this.outputCollapsed = false; // Uses inherited outputCollapsed
    this.outputStatusMessage = "Preparing and downloading model...";
    this.outputChunks = []; // Uses inherited outputChunks
    // this.outputChunksChange.emit(this.outputChunks); // Uses inherited outputChunksChange
    this.output = ""; // Uses inherited output
    this.error = undefined; // Uses inherited error
    this.outputStatusMessage = "Running query...";
    this.loaded = 0; // Uses inherited loaded

    try {
      const self = this;
      // Abort controllers are inherited: this.abortControllerFromCreate, this.abortController
      // this.abortControllerFromCreate  = new AbortController(); // Remove, use inherited
      // this.abortController = new AbortController(); // Remove, use inherited

      // @ts-expect-error Rewriter might not be on window directly
      const rewriter = await window.Rewriter.create({
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
        const stream: ReadableStream = rewriter.rewriteStreaming(this.input, {context: this.contextFormControl.value, signal: this.abortController?.signal}); // Use inherited abortController

        let hasFirstResponse = false;

        for await (const chunk of stream) {
          if(!hasFirstResponse) {
            hasFirstResponse = true;
            this.lapFirstResponseTime(); // From BaseWritingAssistanceApiComponent
          }

          // TextUtils might need to be imported or accessed differently if not static
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
        const rewriterOutput = await rewriter.rewrite(this.input, {context: this.contextFormControl.value, signal: this.abortController?.signal}); // Use inherited abortController
        this.executionPerformance.totalNumberOfWords = TextUtils.countWords(rewriterOutput);
        this.emitExecutionPerformanceChange();

        this.output = rewriterOutput; // Uses inherited output
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

  RewriterToneEnum = RewriterToneEnum;
  RewriterFormatEnum = RewriterFormatEnum;
  RewriterLengthEnum = RewriterLengthEnum;
  protected readonly LocaleEnum = LocaleEnum;
}
