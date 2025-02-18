import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl} from "@angular/forms";
import {TaskStatus} from "../../enums/task-status.enum";
import {RequirementStatus} from "../../enums/requirement-status.enum";
import {languages} from "../../constants/languages.constants";
import {TranslatorApiVersionEnum} from "../../enums/translator-api-version.enum";
import {CurrentApiExecutor} from "./current-api.executor";
import {ExplainerApiExecutor} from "./explainer-api.executor";
import {RequirementInterface} from "./interfaces/requirement.interface";
import {ApiExecutorInterface} from "./interfaces/api-executor.interface";
import {Step1} from "./interfaces/step-1.interface";
import {Step0} from "./interfaces/step-0.interface";
import {ActivatedRoute, Router} from '@angular/router';
import {Subscription} from 'rxjs';
import {Step2} from './interfaces/step-2.interface';
import {SearchSelectDropdownOptionsInterface} from '../../interfaces/search-select-dropdown-options.interface';
import {Title} from '@angular/platform-browser';
import {AnonymousAnalyticsManager} from '../../managers/anonymous-analytics.manager';
import {AnalyticsSessionModel} from '../../models/analytics-session.model';
import {ApiEnum} from '../../enums/api.enum';

@Component({
  selector: 'app-translator-api',
  templateUrl: './translator-api.component.html',
  standalone: false,
  styleUrl: './translator-api.component.scss'
})
export class TranslatorApiComponent implements OnInit, OnDestroy {
  apiVersion = new FormControl<TranslatorApiVersionEnum>(TranslatorApiVersionEnum.Current);

  languages = languages;
  languageOptions: SearchSelectDropdownOptionsInterface[] = this.languages.map((language) => {
    return {label: language.title, value: language.locale}
  })

  sourceLanguage= new FormControl("en");
  targetLanguage = new FormControl('fr');
  content = new FormControl('');

  apiExecutor!: ApiExecutorInterface;

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

  public subscriptions: Subscription[] = [];

  protected readonly StepStatus = TaskStatus;

  constructor(
      private readonly currentApiExecutor: CurrentApiExecutor,
      private readonly explainerApiExecutor: ExplainerApiExecutor,
      private readonly router: Router,
      private route: ActivatedRoute,
      private title: Title,
      private readonly anonymousAnalyticsManager: AnonymousAnalyticsManager,
      ) {

    this.apiExecutor = currentApiExecutor;
    this.apiVersion.setValue(TranslatorApiVersionEnum.Current);
  }


  ngOnInit() {
    this.title.setTitle('Translator API | AI Playground | etiennenoel.com');

    this.subscriptions.push(this.apiVersion.valueChanges.subscribe((value) => {
      this.router.navigate(['.'], { relativeTo: this.route, queryParams: { apiVersion: value}, queryParamsHandling: 'merge' });

      switch (value) {
        case TranslatorApiVersionEnum.Current:
          this.apiExecutor = this.currentApiExecutor;
          break;

        case TranslatorApiVersionEnum.Explainer:
          this.apiExecutor = this.explainerApiExecutor;
          break;
      }

      this.reset();
    }));

    this.subscriptions.push(this.route.queryParams.subscribe((params) => {
      if(params['apiVersion']) {
        this.apiVersion.setValue(params['apiVersion']);
      }

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

  ngOnDestroy() {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
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
  }

  checkRequirements() {
    this.requirements = this.apiExecutor.checkRequirements();

    this.allRequirementsStatus = this.requirements.translationApiFlag.status;
  }

  async executeStep0() {
    this.steps.step0.status = TaskStatus.Executing;
    this.steps.step0.outputCollapsed = false;

    if(this.sourceLanguage.value === null || this.targetLanguage.value === null) {
      return;
    }

    const response = await this.apiExecutor.executeStep0(this.sourceLanguage.value, this.targetLanguage.value);

    this.steps.step0.log = response.log;
    this.steps.step0.status = response.status
    this.steps.step0.available = response.available;
  }


  async executeStep1() {
    this.steps.step1.status = TaskStatus.Executing;
    this.steps.step1.outputCollapsed = false;

    if(this.sourceLanguage.value === null || this.targetLanguage.value === null) {
      return;
    }

    const response = await this.apiExecutor.executeStep1(this.sourceLanguage.value, this.targetLanguage.value, (progress) => {
      this.steps.step1.bytesDownloaded = progress.bytesDownloaded;
      this.steps.step1.totalBytes = progress.totalBytes;
    });

    this.steps.step1.log = response.log;
    this.steps.step1.status = response.status
  }

  async executeStep2() {
    this.steps.step2.status = TaskStatus.Executing;
    this.steps.step2.outputCollapsed = false;
    this.steps.step2.content = this.content.value ?? "";
    this.steps.step2.targetLanguage = this.targetLanguage.value ?? "";
    this.steps.step2.sourceLanguage = this.sourceLanguage.value ?? "";

    if(this.sourceLanguage.value === null || this.targetLanguage.value === null) {
      return;
    }

    const response = await this.apiExecutor.executeStep2(this.sourceLanguage.value, this.targetLanguage.value, this.content.value);

    await this.anonymousAnalyticsManager.save(new AnalyticsSessionModel(ApiEnum.Translator, {
      sourceLanguage: this.sourceLanguage.value,
      targetLanguage: this.targetLanguage.value,
      content: this.content.value,
    }, response));

    this.steps.step2.translatedContent = response.translatedContent;
    this.steps.step2.log = response.log;
    this.steps.step2.status = response.status
  }

  protected readonly RequirementStatus = RequirementStatus;
  protected readonly TranslatorApiVersionEnum = TranslatorApiVersionEnum;
}
