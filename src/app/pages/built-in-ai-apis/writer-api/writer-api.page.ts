import {Component, EventEmitter, Inject, Input, OnInit, Output, PLATFORM_ID, DOCUMENT} from '@angular/core';
import {TaskStatus} from '../../../enums/task-status.enum';
import {RequirementStatus} from '../../../enums/requirement-status.enum';
import {isPlatformBrowser} from '@angular/common';
import {FormControl} from '@angular/forms';
import {WriterToneEnum} from '../../../enums/writer-tone.enum';
import {WriterFormatEnum} from '../../../enums/writer-format.enum';
import {WriterLengthEnum} from '../../../enums/writer-length.enum';
import {
  BaseWritingAssistanceApiComponent
} from '../../../components/base-writing-assistance-api/base-writing-assistance-api.component';
import {AvailabilityStatusEnum} from '../../../enums/availability-status.enum';
import {RequirementInterface} from '../../../interfaces/requirement.interface';
import {ActivatedRoute, Router} from '@angular/router';
import {Title} from '@angular/platform-browser';
import {ExecutionPerformanceManager} from '../../../managers/execution-performance.manager';
import {BuiltInAiApiEnum} from '../../../enums/built-in-ai-api.enum';


@Component({
  selector: 'app-writer',
  templateUrl: './writer-api.page.html',
  standalone: false,
  styleUrl: './writer-api.page.scss'
})
export class WriterApiPage extends BaseWritingAssistanceApiComponent implements OnInit {

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

  apiFlagContentHtml = `Activate <span class=\"code\">chrome://flags/#writer-api-for-gemini-nano</span>`;

  getRequirement(): RequirementInterface {
    return {
      ...this.apiFlag,
      contentHtml: this.apiFlagContentHtml,
    }
  }

  get checkAvailabilityCode() {
    return `Writer.availability({
  tone: '${this.toneFormControl.value}',
  format: '${this.formatFormControl.value}',
  length: '${this.lengthFormControl.value}',
  expectedInputLanguages: ${JSON.stringify(this.expectedInputLanguagesFormControl.value)},
  expectedContextLanguages: ${JSON.stringify(this.expectedContextLanguagesFormControl.value)},
  outputLanguage: '${this.outputLanguageFormControl.value}',
})`
  }

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(DOCUMENT) document: Document,
    router: Router,
    route: ActivatedRoute,
    title: Title,
    private readonly executionPerformanceManager: ExecutionPerformanceManager
  ) {
    super(document, router, route, title);
  }

  get writeCode() {
    if(this.useStreamingFormControl.value) {
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
  signal: abortController.signal,
})

const stream: ReadableStream = writer.writeStreaming('${this.inputFormControl.value}', {context: '${this.contextFormControl.value}'});

let output = "";
for await (const chunk of stream) {
  // Do something with each 'chunk'
  output += chunk;
}

// See the complete response here
console.log(output);`;
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
  signal: abortController.signal,
})

const output = await writer.write('${this.inputFormControl.value}', {context: '${this.contextFormControl.value}'})

// See the complete response here
console.log(output);`;
    }
  }


  override ngOnInit() {
    super.ngOnInit();

    this.checkRequirements()
    this.executionPerformanceManager.reset()

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
      this.setLength(value, {emitChangeEvent: true, emitFormControlEvent: false});
    }));
  }

  checkRequirements() {
    if (isPlatformBrowser(this.platformId) && (!this.window || !("Writer" in this.window))) {
      this.apiFlag.status = RequirementStatus.Fail;
      this.apiFlag.message = "'Writer' is not defined. Activate the flag.";
    } else if(isPlatformBrowser(this.platformId)) {
      this.apiFlag.status = RequirementStatus.Pass;
      this.apiFlag.message = "Passed";
    }
  }

  async checkAvailability() {
    try {
      // @ts-ignore
      this.availabilityStatus = await Writer.availability({
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

  async write() {
    this.status = TaskStatus.Executing;
    this.outputCollapsed = false;
    this.outputStatusMessage = "Preparing and downloading model...";
    this.loaded = 0;
    this.outputChunks = [];
    this.outputChunksChange.emit(this.outputChunks);
    this.output = "";
    this.error = undefined;
    this.outputStatusMessage = "Running query...";
    this.executionPerformanceManager.start(BuiltInAiApiEnum.Writer)

    try {
      const self = this;
      this.abortControllerFromCreate  = new AbortController();
      this.abortController = new AbortController();

      this.executionPerformanceManager.sessionCreationStarted({
        tone: this.toneFormControl.value,
        format: this.formatFormControl.value,
        length: this.lengthFormControl.value,
        sharedContext: this.sharedContextFormControl.value,
        expectedInputLanguages: this.expectedInputLanguagesFormControl.value,
        expectedContextLanguages: this.expectedContextLanguagesFormControl.value,
        outputLanguage: this.outputLanguageFormControl.value,});

      // @ts-expect-error
      const writer = await Writer.create({
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
            self.loaded = e.loaded;

            self.executionPerformanceManager.downloadUpdated(e.loaded)
          });
        },
        signal: this.abortControllerFromCreate.signal,
      });
      this.executionPerformanceManager.sessionCreationCompleted();

      this.executionPerformanceManager.inferenceStarted({streaming: this.useStreamingFormControl.value, input: this.input, context: this.contextFormControl.value})
      if(this.useStreamingFormControl.value) {
        this.abortController = new AbortController();
        const stream: ReadableStream = writer.writeStreaming(this.input, {context: this.contextFormControl.value, signal: this.abortController.signal});

        for await (const chunk of stream) {
          this.executionPerformanceManager.tokenReceived();

          // Do something with each 'chunk'
          this.output += chunk;
          this.outputChunks.push(chunk);
          this.outputChunksChange.emit(this.outputChunks);
        }

      }
      else {
        const output = await writer.write(this.input, {context: this.contextFormControl.value, signal: this.abortController.signal});
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
      this.executionPerformanceManager.inferenceCompleted()
    }

  }

  WriterToneEnum = WriterToneEnum;
  WriterFormatEnum = WriterFormatEnum;
  WriterLengthEnum = WriterLengthEnum;
}
