import {Component, EventEmitter, Inject, Input, OnInit, Output, PLATFORM_ID} from '@angular/core';
import {DOCUMENT} from '@angular/common'; // Removed isPlatformBrowser
// RequirementStatus, BaseComponent, RequirementStatusInterface, RequirementInterface, BasePageComponent removed
import {AvailabilityStatusEnum} from '../../enums/availability-status.enum';
import {LocaleEnum} from '../../enums/locale.enum';
import {FormControl} from '@angular/forms';
import {TaskStatus} from '../../enums/task-status.enum';
import {ActivatedRoute, Router} from '@angular/router';
import {Title} from '@angular/platform-browser';
import {BaseApiPageComponent} from '../../components/base/base-api-page.component'; // Added BaseApiPageComponent

@Component({
  selector: 'app-language-detector',
  templateUrl: './language-detector.component.html',
  standalone: false,
  styleUrl: './language-detector.component.scss'
})
export class LanguageDetectorComponent extends BaseApiPageComponent implements OnInit { // Changed heritage

  // apiName and apiFlagName for BaseApiPageComponent
  public apiName = 'LanguageDetector';
  public apiFlagName = 'chrome://flags/#language-detection-api';

  // Removed apiFlag (inherited)
  // Removed availabilityStatus (inherited)
  // Removed error (inherited)
  // Removed outputCollapsed (inherited)
  // Removed output (inherited)
  // Removed detectionStatus (use this.status)
  // Removed availabilityTaskStatus (use this.status or local var if specific)

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

  // Removed Download Progress section (loaded, loadedChange - inherited)
  // Removed AbortControllerFromCreate section (inherited)
  // Removed AbortController section (inherited)

  inputFormControl = new FormControl<string>("");

  results: {
    confidence: number;
    detectedLanguage: string;
  }[] = []

  constructor(
    @Inject(DOCUMENT) document: Document, // platformId removed from here
    @Inject(PLATFORM_ID) platformId: Object, // Added platformId for super
    router: Router, // No longer private readonly
    route: ActivatedRoute, // No longer private readonly
    titleService: Title, // Renamed from title
  ) {
    super(document, platformId, titleService, router, route); // Updated super call
  }

  override ngOnInit() {
    super.ngOnInit(); // Call to super.ngOnInit()

    this.setTitle('Language Detector API | AI Playground');

    // this.checkRequirements() // Removed, handled by BaseApiPageComponent's ngOnInit

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

  // Removed checkRequirements() (handled by BaseApiPageComponent)
  // Removed getRequirements() (BaseApiPageComponent has getRequirement())

  // checkAvailabilityCode getter remains (used by BaseApiPageComponent)
  get checkAvailabilityCode(): string {
    return `const availabilityStatus = await LanguageDetector.availability({
  expectedInputLanguages: ${JSON.stringify(this.expectedInputLanguagesFormControl.value)},
});`;
  }

  // Renamed from checkAvailabilityExplainer to checkAvailability (implementing abstract method)
  // todo: remove the old checkAvailability method if this one is sufficient.
  async checkAvailability(): Promise<void> { // Implements abstract method
    // this.availabilityTaskStatus = TaskStatus.Executing; // Use this.status or local var
    this.status = TaskStatus.InProgress; // Example, or use a local status
    this.availabilityError = undefined; // Clear previous error
    try {
      // @ts-expect-error LanguageDetector might not be recognized on window.ai without proper typing
      const availability = await this.window?.ai.languageDetector.availability({
        expectedInputLanguages: this.expectedInputLanguagesFormControl.value,
      });
      this.availabilityStatus = availability as AvailabilityStatusEnum; // Cast if necessary
      // this.availabilityTaskStatus = TaskStatus.Completed;
      this.status = TaskStatus.Completed; // Example
    } catch (e: any) {
      this.availabilityError = e; // Set error on base class
      this.availabilityStatus = AvailabilityStatusEnum.Unknown; // Or appropriate error status
      // this.availabilityTaskStatus = TaskStatus.Error;
      this.status = TaskStatus.Error; // Example
    }
  }

  // Renamed from detectCode to executeCode (implementing abstract getter)
  get executeCode(): string {
    return `const detector = await LanguageDetector.create({
  expectedInputLanguages: ${JSON.stringify(this.expectedInputLanguagesFormControl.value)},
  monitor(m: any)  {
    m.addEventListener("downloadprogress", (e: any) => {
      console.log(\`Downloaded \${e.loaded * 100}%\`);
      // this.loaded = e.loaded; // Use inherited this.loaded
    });
  },
  // signal: this.abortController?.signal, // Use inherited abortController
});

const results = await detector.detect("${this.inputFormControl.value}", {
  // signal: this.abortController?.signal, // Use inherited abortController
});
`;
  }

  // Renamed from detect to execute (implementing abstract method)
  async execute(): Promise<void> { // Implements abstract method
    const self = this; // Keep 'self' if used in callbacks that change 'this' context, like the monitor
    this.outputCollapsed = false; // this is inherited
    this.status = TaskStatus.Executing; // Use inherited status
    this.error = undefined; // Use inherited error

    try {
      // @ts-expect-error LanguageDetector might not be recognized, and 'ai' on window
      const detector = await this.window?.ai.languageDetector.create({
        expectedInputLanguages: this.expectedInputLanguagesFormControl.value,
        monitor(m: any) {
          m.addEventListener("downloadprogress", (e: any) => {
            self.loaded = e.loaded; // Use inherited loaded
          });
        },
        signal: this.abortController?.signal, // Use inherited abortController
      });

      this.results = await detector.detect(this.inputFormControl.value, {
        signal: this.abortController?.signal, // Use inherited abortController
      });

      this.status = TaskStatus.Completed; // Use inherited status
    } catch (e: any) {
      this.error = e; // Use inherited error
      this.status = TaskStatus.Error; // Use inherited status
    }
  }

  // Removed abortTriggered (inherited)
  // Removed abortFromCreateTriggered (inherited)

  protected readonly AvailabilityStatusEnum = AvailabilityStatusEnum;
  protected readonly LocaleEnum = LocaleEnum;
}
