import {Component, Inject, OnDestroy, OnInit, PLATFORM_ID, DOCUMENT} from '@angular/core';
import {FormControl} from "@angular/forms";
import {TaskStatus} from "../../../enums/task-status.enum";
import {RequirementStatus} from "../../../enums/requirement-status.enum";
import {languages} from "../../../constants/languages.constants";
import {TranslatorApiVersionEnum} from "../../../enums/translator-api-version.enum";

import {RequirementInterface} from "./interfaces/requirement.interface";
import {Step1} from "./interfaces/step-1.interface";
import {Step0} from "./interfaces/step-0.interface";
import {ActivatedRoute, Router} from '@angular/router';
import {Step2} from './interfaces/step-2.interface';
import {SearchSelectDropdownOptionsInterface} from '../../../interfaces/search-select-dropdown-options.interface';
import {Title} from '@angular/platform-browser';
import {isPlatformBrowser} from '@angular/common';
import {BaseBuiltInApiPageComponent} from '../../../components/base/base-built-in-api-page.component';
import {ExecutionPerformanceManager} from '../../../managers/execution-performance.manager';
import {BuiltInAiApiEnum} from '../../../enums/built-in-ai-api.enum';

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
export class TranslatorApiComponent extends BaseBuiltInApiPageComponent implements OnInit, OnDestroy {
  languages = languages;
  languageOptions: SearchSelectDropdownOptionsInterface[] = this.languages.map((language) => {
    return {label: language.title, value: language.locale}
  })

  sourceLanguage= new FormControl("en");
  targetLanguage = new FormControl('fr');
  content = new FormControl('');

  requirements: RequirementInterface = {
    translationApiFlag: {
        status: RequirementStatus.Pending,
      message: "Checking",
      contentHtml: `Activate <span class="code">chrome://flags/#translation-api</span>`,
    }
  }

  allRequirementsStatus: RequirementStatus = RequirementStatus.Pending;

  steps!: {
    step0: Step0,
    step1: Step1,
    step2: Step2,
  };

  protected readonly StepStatus = TaskStatus;

  constructor(
      router: Router,
      route: ActivatedRoute,
      @Inject(DOCUMENT) document: Document,
      @Inject(PLATFORM_ID) private platformId: Object,
      title: Title,
      public readonly executionPerformanceManager: ExecutionPerformanceManager,
      ) {
    super(document, title, router, route)
  }


  override ngOnInit() {
    super.ngOnInit();

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

    this.reset();
  }

  getAllRequirements() {
    return [this.requirements.translationApiFlag];
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

    this.checkRequirements()
    this.executionPerformanceManager.reset();
  }

  checkRequirements() {
    if (isPlatformBrowser(this.platformId) && (!this.window || !("Translator" in window))) {
      this.requirements.translationApiFlag.status = RequirementStatus.Fail;
      this.requirements.translationApiFlag.message = "'Translator' is not defined. Activate the flag.";
    } else if(isPlatformBrowser(this.platformId)) {
      this.requirements.translationApiFlag.status = RequirementStatus.Pass;
      this.requirements.translationApiFlag.message = "Passed";
    } else {
      this.requirements.translationApiFlag.status = RequirementStatus.Pending;
      this.requirements.translationApiFlag.message = "Checking";
    }

    this.allRequirementsStatus = this.requirements.translationApiFlag.status;
  }

  get checkAvailabilityCode(){
    return `const availability = await Translator.availability({sourceLanguage: "${this.sourceLanguage.value}", targetLanguage: "${this.targetLanguage.value}"});
console.log(Result of availability: '\${availability}'.);`;
  }

  async checkAvailability() {
    // @ts-expect-error
    this.availabilityStatus = await Translator.availability({sourceLanguage: this.sourceLanguage.value, targetLanguage:this.targetLanguage.value});
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
      const self = this;
      this.status = TaskStatus.Executing;
      this.outputCollapsed = false;
      this.error = undefined;
      this.output = "";
      this.loaded = 0;
      this.executionPerformanceManager.start(BuiltInAiApiEnum.Translator);

      this.executionPerformanceManager.sessionCreationStarted({
        sourceLanguage: this.sourceLanguage.value,
        targetLanguage: this.targetLanguage.value});

      // @ts-expect-error
      const translator = await Translator.create({
        sourceLanguage: this.sourceLanguage.value,
        targetLanguage: this.targetLanguage.value,
        monitor(m: any) {
          m.addEventListener("downloadprogress", (e: any) => {
            self.loaded = e.loaded;

            self.executionPerformanceManager.downloadUpdated(self.loaded);
          });
        },
      });
      this.executionPerformanceManager.sessionCreationCompleted();

      this.executionPerformanceManager.inferenceStarted({input: this.content.value})
      this.output = await translator.translate(this.content.value);
      this.executionPerformanceManager.tokenReceived();

      this.status = TaskStatus.Completed;
    } catch (e: any) {
      this.status = TaskStatus.Error;
      this.error = e;
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

  protected readonly TranslatorApiVersionEnum = TranslatorApiVersionEnum;
}
