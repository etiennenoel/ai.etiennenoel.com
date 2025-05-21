import {Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core'; // PLATFORM_ID removed
import {DOCUMENT, isPlatformBrowser} from '@angular/common';
import {RequirementStatus} from '../../enums/requirement-status.enum';
// BaseComponent removed
// RequirementStatusInterface removed
import {AvailabilityStatusEnum} from '../../enums/availability-status.enum';
import {LocaleEnum} from '../../enums/locale.enum';
import {FormControl} from '@angular/forms';
// TaskStatus removed
import {ActivatedRoute, Router} from '@angular/router';
// RequirementInterface removed
import {Title} from '@angular/platform-browser';
import {BasePageComponent} from '../../components/base/base-page.component';
import { PLATFORM_ID } from '@angular/core'; // ensure PLATFORM_ID is imported for constructor
import { TaskStatus } from '../../enums/task-status.enum'; // ensure TaskStatus is imported
import { RequirementInterface } from '../../interfaces/requirement.interface'; // ensure RequirementInterface is imported


@Component({
  selector: 'app-language-detector',
  templateUrl: './language-detector.component.html',
  standalone: false,
  styleUrl: './language-detector.component.scss'
})
export class LanguageDetectorComponent extends BasePageComponent implements OnInit {

  // Specific apiFlag for LanguageDetector
  public override apiFlag: RequirementInterface = { // 'override' keyword added
    status: RequirementStatus.Pending,
    message: 'Pending',
    contentHtml: `Activate <span class="code">chrome://flags/#language-detection-api</span>`,
  }

  availabilityStatus: AvailabilityStatusEnum = AvailabilityStatusEnum.Unknown;

  // error, outputCollapsed, output are inherited.
  // detectionStatus, availabilityTaskStatus are replaced by inherited 'status'.

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

  // <editor-fold desc="Download Progress">
  // _loaded, loaded, loadedChange, _abortControllerFromCreate, abortControllerFromCreate, abortControllerFromCreateChange, _abortController, abortController, abortControllerChange removed
  // </editor-fold>

  inputFormControl = new FormControl<string>("");

  results: {
    confidence: number;
    detectedLanguage: string;
  }[] = []

  constructor(
    @Inject(PLATFORM_ID) platformId: object, // Removed 'private'
    @Inject(DOCUMENT) document: Document,
    protected override route: ActivatedRoute, // Added 'protected', 'override'
    protected override router: Router, // Added 'protected', 'override'
    protected override titleService: Title, // Changed 'title' to 'titleService', added 'protected', 'override'
  ) {
    super(platformId, document, router, route, titleService); // Passed all params to super
  }

  override ngOnInit() {
    super.ngOnInit();
    this.outputCollapsed = true; // Ensure output is initially collapsed

    this.titleService.setTitle('Language Detector API | AI Playground'); // Used titleService

    this.checkRequirements() // This now calls the implemented abstract method

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

  override checkRequirements(): void { // Added 'override', return type 'void'
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

  override async checkAvailability(): Promise<void> { // Added 'override', return type 'Promise<void>'
    try {
      this.status = TaskStatus.Executing; // Used inherited 'status' (was availabilityTaskStatus)

      // @ts-expect-error LanguageDetector is a global
      const capabilities = await LanguageDetector.availability({
        expectedInputLanguages: this.expectedInputLanguagesFormControl.value,
      })

      this.availabilityStatus = capabilities;

      this.status = TaskStatus.Completed; // Used inherited 'status'
    } catch (e: any) {
      this.error = e; // Used inherited 'error'
      this.availabilityStatus = AvailabilityStatusEnum.No;
      this.status = TaskStatus.Error; // Used inherited 'status'
    }
  }

  // checkAvailabilityExplainer removed

  get detectCode(): string {
    return `const detector = await LanguageDetector.create({
  expectedInputLanguages: ${JSON.stringify(this.expectedInputLanguagesFormControl.value)},
  monitor(m: any)  {
    m.addEventListener("downloadprogress", (e: any) => {
      console.log(\`Downloaded \${e.loaded * 100}%\`);
    });
  },
  signal: this.abortController.signal, // Used inherited 'abortController'
});

const results = await detector.detect("${this.inputFormControl.value}", {
  signal: this.abortController.signal, // Used inherited 'abortController'
});
`;
  }

  async detect() {
    try {
      // const self = this; // Removed
      this.outputCollapsed = false; // Inherited property
      this.status = TaskStatus.Executing; // Used inherited 'status' (was detectionStatus)
      this.error = undefined; // Inherited property

      // @ts-expect-error LanguageDetector is a global
      const detector = await LanguageDetector.create({
        expectedInputLanguages: this.expectedInputLanguagesFormControl.value,
        monitor: (m: any) => { // Arrow function for 'this'
          m.addEventListener("downloadprogress", (e: any) => {
            this.loaded = e.loaded; // Used inherited 'loaded'
          });
        },
        signal: this.abortControllerFromCreate.signal, // Used inherited 'abortControllerFromCreate'
      });

      this.results = await detector.detect(this.inputFormControl.value!, { // Added non-null assertion
        signal: this.abortController.signal, // Used inherited 'abortController'
      });

      this.status = TaskStatus.Completed; // Used inherited 'status'
    } catch (e: any) {
      this.error = e; // Inherited property
      this.status = TaskStatus.Error; // Used inherited 'status'
    }
  }

  // abortTriggered and abortFromCreateTriggered are inherited.

  protected readonly AvailabilityStatusEnum = AvailabilityStatusEnum;
  protected readonly LocaleEnum = LocaleEnum;
}
