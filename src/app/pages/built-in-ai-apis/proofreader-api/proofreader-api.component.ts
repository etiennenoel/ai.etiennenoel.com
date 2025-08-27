import {Component, EventEmitter, Inject, Input, OnInit, Output, PLATFORM_ID, DOCUMENT} from '@angular/core';
import {TaskStatus} from '../../../enums/task-status.enum';
import {RequirementStatus} from '../../../enums/requirement-status.enum';
import {isPlatformBrowser} from '@angular/common';
import {FormControl} from '@angular/forms';
import {BaseWritingAssistanceApiComponent} from '../../../components/base-writing-assistance-api/base-writing-assistance-api.component';
import {TextUtils} from '../../../utils/text.utils';
import {AvailabilityStatusEnum} from '../../../enums/availability-status.enum';
import {SearchSelectDropdownOptionsInterface} from '../../../interfaces/search-select-dropdown-options.interface';
import {LocaleEnum} from '../../../enums/locale.enum';
import {RewriterLengthEnum} from '../../../enums/rewriter-length.enum';
import {RewriterFormatEnum} from '../../../enums/rewriter-format.enum';
import {RewriterToneEnum} from '../../../enums/rewriter-tone.enum';
import {ActivatedRoute, Router} from '@angular/router';
import {RequirementInterface} from '../../../interfaces/requirement.interface';
import {Title} from '@angular/platform-browser';
import {BasePageComponent} from '../../../components/base/base-page.component';
import {RequirementStatusInterface} from '../../../interfaces/requirement-status.interface';
import {BaseBuiltInApiPageComponent} from '../../../components/base/base-built-in-api-page.component';


@Component({
  selector: 'app-proofreader',
  templateUrl: './proofreader-api.component.html',
  standalone: false,
  styleUrl: './proofreader-api.component.scss'
})
export class ProofreaderApiComponent  extends BaseBuiltInApiPageComponent  implements OnInit {

  public apiFlag: RequirementStatusInterface = {
    status: RequirementStatus.Pending,
    message: 'Pending',

  }

  apiFlagContentHtml = `Activate <span class="code">chrome://flags/#proofreader-api-for-gemini-nano</span>`;
  getRequirement(): RequirementInterface {
    return {
      ...this.apiFlag,
      contentHtml: this.apiFlagContentHtml,
    }
  }

  get checkAvailabilityCode() {
    return ``
  }

  get proofreadCode() {
    return ``;
  }

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(DOCUMENT) document: Document,
    router: Router,
    route: ActivatedRoute,
    title: Title,
  ) {
    super(document, title, router, route);
  }


  override ngOnInit() {
    super.ngOnInit();

    this.checkRequirements()

    this.subscriptions.push(this.route.queryParams.subscribe((params) => {
    }));


    // Register form changes events

  }

  checkRequirements() {
    if (isPlatformBrowser(this.platformId) && (!this.window || !("Proofreader" in this.window))) {
      this.apiFlag.status = RequirementStatus.Fail;
      this.apiFlag.message = "'Proofreader' is not defined. Activate the flag.";
    }
    else if(isPlatformBrowser(this.platformId)) {
      this.apiFlag.status = RequirementStatus.Pass;
      this.apiFlag.message = "Passed";
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

  async checkAvailability() {
    try {
    } catch (e: any) {
      this.availabilityStatus = AvailabilityStatusEnum.Unavailable
      this.availabilityError = e;
    }
  }

  async proofread() {
    this.status = TaskStatus.Executing;
    this.outputCollapsed = false;
    this.outputStatusMessage = "Preparing and downloading model...";
    this.output = "";
    this.error = undefined;
    this.outputStatusMessage = "Running query...";
    this.loaded = 0;

    try {
      const self = this;
      this.abortControllerFromCreate  = new AbortController();
      this.abortController = new AbortController();

      // // @ts-expect-error
      // const rewriter = await Rewriter.create({
      //   tone: this.toneFormControl.value,
      //   format: this.formatFormControl.value,
      //   length: this.lengthFormControl.value,
      //   sharedContext: this.sharedContext,
      //   expectedInputLanguages: this.expectedInputLanguagesFormControl.value,
      //   expectedContextLanguages: this.expectedContextLanguagesFormControl.value,
      //   outputLanguage: this.outputLanguageFormControl.value,
      //   monitor(m: any)  {
      //     m.addEventListener("downloadprogress", (e: any) => {
      //       console.log(`Downloaded ${e.loaded * 100}%`);
      //       self.loaded = e.loaded;
      //     });
      //   },
      //   signal: this.abortControllerFromCreate.signal,
      // });

      // this.startExecutionTime();
      //
      // this.executionPerformance.firstResponseNumberOfWords = 0;
      // this.executionPerformance.totalNumberOfWords = 0;
      // this.emitExecutionPerformanceChange();


      this.status = TaskStatus.Completed;
    } catch (e: any) {
      this.status = TaskStatus.Error;
      this.outputStatusMessage = `Error: ${e}`;
      this.error = e;
    } finally {
      //this.stopExecutionTime();
    }

  }
}
