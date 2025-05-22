import {Component, EventEmitter, Inject, OnDestroy, OnInit, Output, PLATFORM_ID} from '@angular/core';
import {FormControl} from "@angular/forms";
import {TaskStatus} from "../../enums/task-status.enum";
// RequirementStatus, RequirementInterface, isPlatformBrowser removed
import {languages} from "../../constants/languages.constants";
import {TranslatorApiVersionEnum} from "../../enums/translator-api-version.enum";

// Step interfaces might need to be adjusted if they rely on removed properties
import {Step1} from "./interfaces/step-1.interface";
import {Step0} from "./interfaces/step-0.interface";
import {ActivatedRoute, Router} from '@angular/router';
import {Step2} from './interfaces/step-2.interface';
import {SearchSelectDropdownOptionsInterface} from '../../interfaces/search-select-dropdown-options.interface';
import {Title} from '@angular/platform-browser';
import {DOCUMENT} from '@angular/common';
import {AvailabilityStatusEnum} from '../../enums/availability-status.enum';
import {LocaleEnum} from '../../enums/locale.enum';
import {BaseApiPageComponent} from '../../components/base/base-api-page.component'; // Changed import

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
export class TranslatorApiComponent extends BaseApiPageComponent implements OnInit, OnDestroy { // Changed heritage
  // Implement abstract members from BaseApiPageComponent
  public apiName = 'Translator';
  public apiFlagName = 'chrome://flags/#translation-api';

  languages = languages; // Retained
  languageOptions: SearchSelectDropdownOptionsInterface[] = this.languages.map((language) => { // Retained
    return {label: language.title, value: language.locale}
  })

  sourceLanguage= new FormControl("en"); // Retained
  targetLanguage = new FormControl('fr'); // Retained
  content = new FormControl(''); // Retained

  // outputCollapsed removed (inherited)
  // availabilityStatus removed (inherited)
  // error removed (inherited)
  // availabilityError removed (inherited)
  // Output section removed (_output, output getter/setter, outputChange, outputChunksChange)
  // Download Progress section removed (_loaded, loaded getter/setter, loadedChange)
  // Task Status section removed (_status, status getter/setter, statusChange)
  // AbortController sections removed

  // requirements: RequirementInterface removed
  // allRequirementsStatus: RequirementStatus removed

  steps!: { // Retained
    step0: Step0,
    step1: Step1,
    step2: Step2,
  };

  protected readonly StepStatus = TaskStatus; // Retained

  constructor(
      @Inject(DOCUMENT) document: Document, // Order changed, platformId added
      @Inject(PLATFORM_ID) platformId: Object, // Added platformId for super
      router: Router, // No longer private readonly
      route: ActivatedRoute, // No longer private
      titleService: Title, // Renamed from title
      ) {
    super(document, platformId, titleService, router, route); // Updated super call
  }

  override ngOnInit() {
    super.ngOnInit(); // Call to super.ngOnInit()

    this.setTitle('Translator API | AI Playground');

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

    this.reset(); // Call to modified reset
  }

  // getAllRequirements() removed

  reset() { // Modified reset
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
    // this.checkRequirements() // Removed call from here
  }

  // checkRequirements() method removed

  // checkAvailabilityCode getter remains (implements abstract member)
  get checkAvailabilityCode(){
    return `const availability = await Translator.availability({sourceLanguage: "${this.sourceLanguage.value}", targetLanguage: "${this.targetLanguage.value}"});
console.log(Result of availability: '\${availability}'.);`;
  }

  // checkAvailability method adapted (implements abstract member)
  async checkAvailability(): Promise<void> {
    this.availabilityError = undefined; // Use inherited
    try {
      // @ts-expect-error Translator might not be on window directly
      this.availabilityStatus = await window.Translator.availability({sourceLanguage: this.sourceLanguage.value, targetLanguage:this.targetLanguage.value}); // Use inherited
    } catch (e: any) {
      this.availabilityStatus = AvailabilityStatusEnum.Unavailable; // Use inherited
      this.availabilityError = e; // Use inherited
    }
  }

  // Renamed from translateCode to executeCode (implements abstract member)
  get executeCode() {
    return `const translator = await Translator.create({
    sourceLanguage: "${this.sourceLanguage.value}",
    targetLanguage: "${this.targetLanguage.value}",
    monitor(m) {
        m.addEventListener("downloadprogress", e => {
            console.log(\`Downloaded \${e.loaded} of \${e.total} bytes.\`);
            // this.loaded = e.loaded; // Use inherited this.loaded
        });
    },
    // signal: this.abortController?.signal, // Use inherited abortController
});
await translator.translate("${this.content.value}")
`;
  }

  // Renamed from translate to execute (implements abstract member)
  async execute(): Promise<void> {
    const self = this; // Keep 'self' if used in callbacks
    this.status = TaskStatus.Executing; // Use inherited status
    this.outputCollapsed = false; // Use inherited outputCollapsed
    this.error = undefined; // Use inherited error
    this.output = ""; // Use inherited output
    this.loaded = 0; // Use inherited loaded

    try {
      // @ts-expect-error Translator might not be on window directly
      const translator = await window.Translator.create({
        sourceLanguage: this.sourceLanguage.value,
        targetLanguage: this.targetLanguage.value,
        monitor(m: any) {
          m.addEventListener("downloadprogress", (e: any) => {
            self.loaded = e.loaded; // Use inherited loaded
          });
        },
        signal: this.abortController?.signal, // Use inherited abortController
      });

      this.output = await translator.translate(this.content.value); // Use inherited output
      this.status = TaskStatus.Completed; // Use inherited status
    } catch (e: any) {
      this.status = TaskStatus.Error; // Use inherited status
      this.error = e; // Use inherited error
    }
  }

  // abortTriggered removed (inherited)
  // abortFromCreateTriggered removed (inherited)

  protected readonly RequirementStatus = RequirementStatus; // This might be removable if RequirementStatus is not used in template
  protected readonly TranslatorApiVersionEnum = TranslatorApiVersionEnum;
  protected readonly AvailabilityStatusEnum = AvailabilityStatusEnum;
  protected readonly LocaleEnum = LocaleEnum;
}
