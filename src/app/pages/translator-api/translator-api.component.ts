import {Component, EventEmitter, Inject, OnDestroy, OnInit, Output } from '@angular/core'; // PLATFORM_ID removed from here
import {FormControl} from "@angular/forms";
// TaskStatus and RequirementStatus will be inherited or imported if needed for non-standard use
import {languages} from "../../constants/languages.constants";
import {TranslatorApiVersionEnum} from "../../enums/translator-api-version.enum";

// PageRequirementInterface might be replaced by the global RequirementInterface if structure is compatible
import {RequirementInterface as PageRequirementInterface} from "./interfaces/requirement.interface";
import {Step1} from "./interfaces/step-1.interface";
import {Step0} from "./interfaces/step-0.interface";
import {ActivatedRoute, Router} from '@angular/router'; // Keep for constructor
import {Step2} from './interfaces/step-2.interface';
import {SearchSelectDropdownOptionsInterface} from '../../interfaces/search-select-dropdown-options.interface';
import {Title} from '@angular/platform-browser'; // Keep for constructor
import {BasePageComponent} from '../../components/base/base-page.component';
import {DOCUMENT, isPlatformBrowser} from '@angular/common'; // Keep for constructor and methods
import {AvailabilityStatusEnum} from '../../enums/availability-status.enum'; // Keep for local property
import {LocaleEnum} from '../../enums/locale.enum'; // Keep for local property
// Import PLATFORM_ID, TaskStatus, RequirementInterface, RequirementStatus for constructor and local properties
import { PLATFORM_ID } from '@angular/core';
import { TaskStatus } from '../../enums/task-status.enum';
import { RequirementInterface } from '../../interfaces/requirement.interface';
import { RequirementStatus } from '../../enums/requirement-status.enum';

declare global {
  interface Translator {
    create: (...args: any) => any;
  }
}

@Component({
  selector: 'app-translator-api',
  templateUrl: './translator-api.component.html',
  standalone: false,
  styleUrl: './translator-api.component.scss'
})
export class TranslatorApiComponent extends BasePageComponent implements OnInit, OnDestroy {
  // Specific properties for TranslatorApiComponent
  languages = languages;
  languageOptions: SearchSelectDropdownOptionsInterface[] = this.languages.map((language) => {
    return {label: language.title, value: language.locale}
  })

  sourceLanguage= new FormControl("en");
  targetLanguage = new FormControl('fr');
  content = new FormControl('');

  // outputCollapsed is inherited, will be set to true in ngOnInit.
  // error is inherited.
  // status is inherited.
  // loaded is inherited.
  // output is inherited.
  // abortController and abortControllerFromCreate are inherited.

  public availabilityStatus: AvailabilityStatusEnum = AvailabilityStatusEnum.Unknown; // Keep local
  public availabilityError?: Error; // Keep local

  // <editor-fold desc="Output">
  // _output, output getter/setter, outputChange, outputChunksChange removed (inherited)
  // </editor-fold>

  // <editor-fold desc="Download Progress">
  // _loaded, loaded getter/setter, loadedChange removed (inherited)
  // </editor-fold>

  // <editor-fold desc="Task Status">
  // _status, status getter/setter, statusChange removed (inherited)
  // </editor-fold>

  // <editor-fold desc="AbortControllerFromCreate">
  // _abortControllerFromCreate, getter/setter, event emitter removed (inherited)
  // </editor-fold>

  // <editor-fold desc="AbortController">
  // _abortController, getter/setter, event emitter removed (inherited)
  // </editor-fold>

  // Replace 'requirements' object with a single overridden 'apiFlag'
  public override apiFlag: RequirementInterface = {
    status: RequirementStatus.Pending,
    message: "Checking",
    contentHtml: `Activate <span class="code">chrome://flags/#translation-api</span>`,
  };

  allRequirementsStatus: RequirementStatus = RequirementStatus.Pending; // This might be redundant if apiFlag.status is used directly

  steps!: {
    step0: Step0,
    step1: Step1,
    step2: Step2,
  };

  protected readonly StepStatus = TaskStatus; // This is fine, aliasing TaskStatus

  constructor(
      // Parameters updated to match BasePageComponent constructor
      @Inject(PLATFORM_ID) platformId: object, // Add platformId
      @Inject(DOCUMENT) document: Document,
      protected override router: Router, // Add protected override
      protected override route: ActivatedRoute, // Add protected override
      protected override titleService: Title, // Add protected override, rename title
      ) {
    // Call super with all required parameters for BasePageComponent
    super(platformId, document, router, route, titleService);
  }


  override ngOnInit() {
    super.ngOnInit();
    this.outputCollapsed = true; // Set initial state for inherited property

    this.titleService.setTitle('Translator API | AI Playground'); // Use inherited titleService

    this.subscriptions.push(this.route.queryParams.subscribe((params) => {
      if(params['sourceLanguage']) {
        this.sourceLanguage.setValue(params['sourceLanguage']);
      }
      if(params['targetLanguage']) {
        this.targetLanguage.setValue(params['targetLanguage']);
      }
      if(params['content']) {
        this.content.setValue(params['content']);
      }
    }));

    this.subscriptions.push(this.sourceLanguage.valueChanges.subscribe((value) => {
      this.router.navigate(['.'], { relativeTo: this.route, queryParams: { sourceLanguage: value}, queryParamsHandling: 'merge' });
    }));

    this.subscriptions.push(this.targetLanguage.valueChanges.subscribe((value) => {
      this.router.navigate(['.'], { relativeTo: this.route, queryParams: { targetLanguage: value}, queryParamsHandling: 'merge' });
    }));

    this.subscriptions.push(this.content.valueChanges.subscribe((value) => {
      this.router.navigate(['.'], { relativeTo: this.route, queryParams: { content: value}, queryParamsHandling: 'merge' });
    }));

    this.reset();
  }

  // getAllRequirements might be simplified or removed if only one main requirement (apiFlag)
  getAllRequirements() {
    return [this.apiFlag]; // Now returns the overridden apiFlag
  }

  reset() {
    this.steps = {
      step0: {
        status: TaskStatus.Idle,
        available: "",
        outputCollapsed: true,
        log: "",
      },
      step1: {
        status: TaskStatus.Idle,
        totalBytes: 0,
        bytesDownloaded: 0,
        outputCollapsed: true,
        log: "",
      },
      step2: {
        status: TaskStatus.Idle,
        translatedContent: "",
        outputCollapsed: true,
        log: "",
        sourceLanguage: "",
        targetLanguage: "",
        content: "",
      }
    }

    this.checkRequirements(); // This will call the method below
  }

  // This becomes the implementation of the abstract checkRequirements
  override checkRequirements(): void {
    if (isPlatformBrowser(this.platformId) && (!this.window || !("Translator" in window))) {
      this.apiFlag.status = RequirementStatus.Fail; // Update the overridden apiFlag
      this.apiFlag.message = "'Translator' is not defined. Activate the flag.";
    } else if(isPlatformBrowser(this.platformId)) {
      this.apiFlag.status = RequirementStatus.Pass;
      this.apiFlag.message = "Passed";
    } else {
      this.apiFlag.status = RequirementStatus.Pending;
      this.apiFlag.message = "Checking";
    }
    // Update allRequirementsStatus based on the new apiFlag status
    this.allRequirementsStatus = this.apiFlag.status;
  }

  get checkAvailabilityCode(){
    return `const availability = await Translator.availability({sourceLanguage: "${this.sourceLanguage.value}", targetLanguage: "${this.targetLanguage.value}"});
console.log(Result of availability: '\${availability}'.);`;
  }

  // This becomes the implementation of the abstract checkAvailability
  override async checkAvailability(): Promise<void> {
    try {
      // @ts-expect-error Translator is a global
      this.availabilityStatus = await Translator.availability({sourceLanguage: this.sourceLanguage.value, targetLanguage:this.targetLanguage.value});
    } catch (e: any) {
      this.availabilityStatus = AvailabilityStatusEnum.Unavailable;
      this.availabilityError = e; // Set local availabilityError
      this.error = e; // Also set inherited error
    }
  }

  get translateCode() {
    return `const translator = await Translator.create({
    sourceLanguage: "${this.sourceLanguage.value}",
    targetLanguage: "${this.targetLanguage.value}",
    monitor(m) {
        m.addEventListener("downloadprogress", e => {
            console.log(\`Downloaded \${e.loaded} of \${e.total} bytes.\`);
        });
    },
});
await translator.translate("${this.content.value}")
`;
  }

  async translate() {
    try {
      // const self = this; // self may not be needed if 'this' context is fine
      this.status = TaskStatus.Executing; // Use inherited status
      this.outputCollapsed = false; // Use inherited outputCollapsed
      this.error = undefined; // Use inherited error
      this.output = ""; // Use inherited output
      this.loaded = 0; // Use inherited loaded

      // @ts-expect-error Translator is a global
      const translator = await Translator.create({
        sourceLanguage: this.sourceLanguage.value,
        targetLanguage: this.targetLanguage.value,
        monitor: (m: any) => { // Arrow function to preserve 'this'
          m.addEventListener("downloadprogress", (e: any) => {
            this.loaded = e.loaded; // Use inherited loaded
          });
        },
        signal: this.abortControllerFromCreate.signal, // Use inherited controller signal
      });

      // Use inherited abortController for the translate call itself if applicable
      this.output = await translator.translate(this.content.value, { signal: this.abortController.signal });

      this.status = TaskStatus.Completed; // Use inherited status
    } catch (e: any) {
      this.status = TaskStatus.Error; // Use inherited status
      this.error = e; // Use inherited error
    }
  }

  // abortTriggered and abortFromCreateTriggered are inherited.

  protected readonly RequirementStatus = RequirementStatus; // Keep for template if used
  protected readonly TranslatorApiVersionEnum = TranslatorApiVersionEnum;
  protected readonly AvailabilityStatusEnum = AvailabilityStatusEnum;
  protected readonly LocaleEnum = LocaleEnum;
}
