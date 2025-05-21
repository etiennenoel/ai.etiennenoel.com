import {Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core'; // PLATFORM_ID removed if only for base
import {RequirementStatus} from '../../enums/requirement-status.enum'; // Keep for local apiFlag
import {DOCUMENT, isPlatformBrowser} from '@angular/common'; // Keep for super()
import {FormControl} from '@angular/forms';
import {BaseWritingAssistanceApiComponent} from '../../components/base-writing-assistance-api/base-writing-assistance-api.component';
import {TextUtils} from '../../utils/text.utils';
import {AvailabilityStatusEnum} from '../../enums/availability-status.enum';
import {SearchSelectDropdownOptionsInterface} from '../../interfaces/search-select-dropdown-options.interface';
import {LocaleEnum} from '../../enums/locale.enum';
// Rewriter enums not used in this specific file's code, but could be in template - leaving for now.
// import {RewriterLengthEnum} from '../../enums/rewriter-length.enum';
// import {RewriterFormatEnum} from '../../enums/rewriter-format.enum';
// import {RewriterToneEnum} from '../../enums/rewriter-tone.enum';
import {ActivatedRoute, Router} from '@angular/router'; // Keep for constructor
import {Title} from '@angular/platform-browser'; // Keep for constructor
import {BasePageComponent} from '../../components/base/base-page.component';
// RequirementStatusInterface removed (apiFlag will be RequirementInterface)
// TaskStatus removed (will use inherited)
// Import PLATFORM_ID, TaskStatus, RequirementInterface explicitly
import { PLATFORM_ID } from '@angular/core';
import { TaskStatus } from '../../enums/task-status.enum';
import { RequirementInterface } from '../../interfaces/requirement.interface';


@Component({
  selector: 'app-proofreader',
  templateUrl: './proofreader-api.component.html',
  standalone: false,
  styleUrl: './proofreader-api.component.scss'
})
export class ProofreaderApiComponent  extends BasePageComponent  implements OnInit {

  protected outputStatusMessage: string = ""; // Specific to this component

  public availabilityStatus: AvailabilityStatusEnum = AvailabilityStatusEnum.Unknown; // Specific to this component's availability check

  // outputCollapsed is inherited, will be set to true in ngOnInit
  // error is inherited
  public availabilityError?: Error; // Specific to this component's availability check

  // Override apiFlag from BasePageComponent
  public override apiFlag: RequirementInterface = {
    status: RequirementStatus.Pending,
    message: 'Pending',
    contentHtml: `Activate <span class="code">chrome://flags/#proofreader-api-for-gemini-nano</span>`
  };

  // getRequirement() is no longer needed as apiFlag is now RequirementInterface and includes contentHtml.

  get checkAvailabilityCode() {
    return ``
  }

  get proofreadCode() {
    return ``;
  }

  // <editor-fold desc="Output">
  // _output, output getter/setter, outputChange, outputChunksChange removed (inherited)
  // </editor-fold>

  // <editor-fold desc="Task Status">
  // _status, status getter/setter, statusChange removed (inherited)
  // </editor-fold>

  // <editor-fold desc="Download Progress">
  // _loaded, loaded getter/setter, loadedChange removed (inherited)
  // </editor-fold>

  // <editor-fold desc="AbortControllerFromCreate">
  // _abortControllerFromCreate, abortControllerFromCreate getter/setter, abortControllerFromCreateChange removed (inherited)
  // </editor-fold>

  // <editor-fold desc="AbortController">
  // _abortController, abortController getter/setter, abortControllerChange removed (inherited)
  // </editor-fold>

  constructor(
    @Inject(PLATFORM_ID) platformId: object, // Pass to super
    @Inject(DOCUMENT) document: Document, // Pass to super
    protected override router: Router, // Pass to super, make protected override
    protected override route: ActivatedRoute, // Pass to super, make protected override
    protected override titleService: Title, // Pass to super, make protected override, rename
  ) {
    super(platformId, document, router, route, titleService);
  }


  override ngOnInit() {
    super.ngOnInit();
    this.outputCollapsed = true; // Preserve original behavior
    this.titleService.setTitle('Proofreader API | AI Playground'); // Set page title

    this.checkRequirements(); // Call implemented abstract method

    this.subscriptions.push(this.route.queryParams.subscribe((params) => {
    }));


    // Register form changes events

  }

  // Implementation of abstract method
  override checkRequirements(): void {
    if (isPlatformBrowser(this.platformId) && (!this.window || !("Proofreader" in this.window))) {
      this.apiFlag.status = RequirementStatus.Fail;
      this.apiFlag.message = "'Proofreader' is not defined. Activate the flag.";
    }
    else if(isPlatformBrowser(this.platformId)) {
      this.apiFlag.status = RequirementStatus.Pass;
      this.apiFlag.message = "Passed";
    }
  }

  // abortTriggered is inherited
  // abortFromCreateTriggered is inherited

  // Implementation of abstract method
  override async checkAvailability(): Promise<void> {
    try {
      // TODO: Add actual availability check logic for Proofreader if available
      // For now, mimics original behavior of doing nothing or setting to unavailable on error
      // Example: this.availabilityStatus = await Proofreader.availability();
      this.availabilityStatus = AvailabilityStatusEnum.Unknown; // Or .Available if known
    } catch (e: any) {
      this.availabilityStatus = AvailabilityStatusEnum.Unavailable;
      this.availabilityError = e; // Keep specific availabilityError
      // this.error = e; // Optionally set general error too
    }
  }

  async proofread() {
    this.status = TaskStatus.Executing; // Use inherited status
    this.outputCollapsed = false; // Use inherited outputCollapsed
    this.outputStatusMessage = "Preparing and downloading model...";
    this.output = ""; // Use inherited output
    this.error = undefined; // Use inherited error
    this.outputStatusMessage = "Running query...";
    this.loaded = 0; // Use inherited loaded

    try {
      // const self = this; // Not needed if not accessing 'this' in a way that loses context
      // Re-initialize inherited controllers, don't declare new local ones
      this.abortController = new AbortController();
      this.abortControllerFromCreate  = new AbortController();

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


      this.status = TaskStatus.Completed; // Use inherited status
    } catch (e: any) {
      this.status = TaskStatus.Error; // Use inherited status
      this.outputStatusMessage = `Error: ${e}`;
      this.error = e; // Use inherited error
    } finally {
      //this.stopExecutionTime();
    }

  }

  protected readonly LocaleEnum = LocaleEnum;
  protected readonly AvailabilityStatusEnum = AvailabilityStatusEnum;
}
