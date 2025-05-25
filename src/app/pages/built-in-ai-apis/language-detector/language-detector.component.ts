import {Component, EventEmitter, Inject, Input, OnInit, Output, PLATFORM_ID} from '@angular/core';
import {DOCUMENT, isPlatformBrowser} from '@angular/common';
import {RequirementStatus} from '../../../enums/requirement-status.enum';
import {AvailabilityStatusEnum} from '../../../enums/availability-status.enum';
import {LocaleEnum} from '../../../enums/locale.enum';
import {FormControl} from '@angular/forms';
import {TaskStatus} from '../../../enums/task-status.enum';
import {ActivatedRoute, Router} from '@angular/router';
import {RequirementInterface} from '../../../interfaces/requirement.interface';
import {Title} from '@angular/platform-browser';
import {BaseBuiltInApiPageComponent} from '../../../components/base/base-built-in-api-page.component';
import {ExecutionPerformanceManager} from '../../../managers/execution-performance.manager';
import {BuiltInAiApiEnum} from '../../../enums/built-in-ai-api.enum';


@Component({
  selector: 'app-language-detector',
  templateUrl: './language-detector.component.html',
  standalone: false,
  styleUrl: './language-detector.component.scss'
})
export class LanguageDetectorComponent extends BaseBuiltInApiPageComponent implements OnInit {

  public apiFlag: RequirementInterface = {
    status: RequirementStatus.Pending,
    message: 'Pending',
    contentHtml: `Activate <span class="code">chrome://flags/#language-detection-api</span>`,
  }

  detectionStatus = TaskStatus.Idle;

  availabilityTaskStatus = TaskStatus.Idle;

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

  setExpectedInputLanguages(value: LocaleEnum[] | null, options?: {
    emitFormControlEvent?: boolean,
    emitChangeEvent?: boolean
  }) {
    this._expectedInputLanguages = value;
    this.expectedInputLanguagesFormControl.setValue(value, {emitEvent: options?.emitFormControlEvent ?? true});
    if (options?.emitChangeEvent ?? true) {
      this.expectedInputLanguagesChange.emit(value);
    }
  }

  @Output()
  expectedInputLanguagesChange = new EventEmitter<LocaleEnum[] | null>();

  // </editor-fold>

  inputFormControl = new FormControl<string>("");

  results: {
    confidence: number;
    detectedLanguage: string;
  }[] = []

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(DOCUMENT) document: Document,
    route: ActivatedRoute,
    router: Router,
    title: Title,
    public readonly executionPerformanceManager: ExecutionPerformanceManager,
  ) {
    super(document, title, router, route);
  }

  override ngOnInit() {
    super.ngOnInit();

    this.setTitle('Language Detector API | AI Playground');

    this.checkRequirements()
    this.executionPerformanceManager.reset();

    this.subscriptions.push(this.route.queryParams.subscribe((params) => {
      if (params['input']) {
        this.inputFormControl.setValue(params['input']);
      }

      if(params['expectedInputLanguages']) {
        if(!Array.isArray(params['expectedInputLanguages'])) {
          this.expectedInputLanguages = [params['expectedInputLanguages']];
        } else {
          this.expectedInputLanguages = params['expectedInputLanguages'];
        }
      }
    }));

    this.subscriptions.push(this.inputFormControl.valueChanges.subscribe((value) => {
      this.router.navigate(['.'], { relativeTo: this.route, queryParams: { input: value}, queryParamsHandling: 'merge' });
    }))

    this.subscriptions.push(this.expectedInputLanguagesFormControl.valueChanges.subscribe((value) => {
      this.router.navigate(['.'], { relativeTo: this.route, queryParams: { expectedInputLanguages: value}, queryParamsHandling: 'merge' });
    }));
  }

  checkRequirements() {
    if (isPlatformBrowser(this.platformId) && (!this.window || !("LanguageDetector" in this.window))) {
      this.apiFlag.status = RequirementStatus.Fail;
      this.apiFlag.message = "'LanguageDetector' is not defined. Activate the flag.";
    } else if(isPlatformBrowser(this.platformId)) {
      this.apiFlag.status = RequirementStatus.Pass;
      this.apiFlag.message = "Passed";
    }
  }

  getRequirements() {
    return [this.apiFlag];
  }

  get availabilityCode(): string {
    return `const availabilityStatus = await LanguageDetector.availability({
  expectedInputLanguages: ${JSON.stringify(this.expectedInputLanguagesFormControl.value)},
});`;
  }

  // todo: remove this.
  async checkAvailability() {
    try {
      this.availabilityTaskStatus = TaskStatus.Executing;

      // @ts-expect-error
      const capabilities = await LanguageDetector.availability({
        expectedInputLanguages: this.expectedInputLanguagesFormControl.value,
      })

      this.availabilityStatus = capabilities;

      this.availabilityTaskStatus = TaskStatus.Completed;
    } catch (e: any) {
      this.error = e;
      this.availabilityStatus = AvailabilityStatusEnum.No;
      this.availabilityTaskStatus = TaskStatus.Error;
    }
  }

  async checkAvailabilityExplainer() {
    try {
      this.availabilityTaskStatus = TaskStatus.Executing;
      this.availabilityStatus = await this.window?.ai.languageDetector.availability({
        expectedInputLanguages: this.expectedInputLanguagesFormControl.value,
      })

      this.availabilityTaskStatus = TaskStatus.Completed;
    } catch (e: any) {
      this.error = e;
      this.availabilityStatus = AvailabilityStatusEnum.No;
      this.availabilityTaskStatus = TaskStatus.Error;
    }
  }

  get detectCode(): string {
    return `const detector = await LanguageDetector.create({
  expectedInputLanguages: ${JSON.stringify(this.expectedInputLanguagesFormControl.value)},
  monitor(m: any)  {
    m.addEventListener("downloadprogress", (e: any) => {
      console.log(\`Downloaded \${e.loaded * 100}%\`);
    });
  },
  signal: abortController.signal,
});

const results = await detector.detect("${this.inputFormControl.value}", {
  signal: abortController.signal,
});
`;
  }

  async detect() {
    try {
      const self = this;
      this.outputCollapsed = false;
      this.detectionStatus = TaskStatus.Executing;
      this.error = undefined;
      this.executionPerformanceManager.start(BuiltInAiApiEnum.LanguageDetector);

      this.executionPerformanceManager.sessionCreationStarted();
      // @ts-expect-error
      const detector = await LanguageDetector.create({
        expectedInputLanguages: this.expectedInputLanguagesFormControl.value,
        monitor(m: any) {
          m.addEventListener("downloadprogress", (e: any) => {
            self.loaded = e.loaded;

            self.executionPerformanceManager.downloadUpdated(self.loaded);
          });
        },
        //signal: abortController.signal,
      });
      this.executionPerformanceManager.sessionCreationCompleted();

      this.executionPerformanceManager.inferenceStarted({input: this.inputFormControl.value})
      this.results = await detector.detect(this.inputFormControl.value, {
        //signal: abortController.signal,
      });
      this.executionPerformanceManager.tokenReceived();

      this.detectionStatus = TaskStatus.Completed;
    } catch (e: any) {
      this.error = e;
      this.detectionStatus = TaskStatus.Error;
      this.executionPerformanceManager.sessionCreationCompleted();
    } finally {
      this.executionPerformanceManager.inferenceCompleted()
    }
  }

  abortTriggered() {
    console.log(`abortTriggered`)
    this.abortController?.abort();
  }

  abortFromCreateTriggered() {
    console.log(`abortFromCreateTriggered`)
    this.abortControllerFromCreate?.abort();
  }
}
