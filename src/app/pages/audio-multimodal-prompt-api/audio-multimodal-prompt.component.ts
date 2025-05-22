import {Component, Inject, OnInit, PLATFORM_ID} from '@angular/core';
import {BaseApiPageComponent} from '../../components/base/base-api-page.component'; // Changed import
// RequirementInterface and RequirementStatus might not be needed directly
// import {RequirementInterface} from '../../interfaces/requirement.interface';
// import {RequirementStatus} from '../../enums/requirement-status.enum';
import {DOCUMENT} from '@angular/common'; // isPlatformBrowser, isPlatformServer removed
import {ActivatedRoute, Router} from '@angular/router';
import {Title} from '@angular/platform-browser';
// FormControl might not be needed if not used
// import {FormControl} from '@angular/forms';
import {AvailabilityStatusEnum} from '../../enums/availability-status.enum'; // Added import
import {TaskStatus} from '../../enums/task-status.enum'; // Added import

@Component({
  selector: 'app-audio-multimodal-prompt',
  templateUrl: './audio-multimodal-prompt.component.html',
  standalone: false,
  styleUrl: './audio-multimodal-prompt.component.scss'
})
export class AudioMultimodalPromptComponent extends BaseApiPageComponent implements OnInit { // Changed heritage

  // apiFlag is inherited from BaseApiPageComponent
  // public apiFlag: RequirementInterface = {
  //   status: RequirementStatus.Pending,
  //   message: 'Pending',
  //   contentHtml: 'Activate <span class="code">chrome://flags/#prompt-api-for-gemini-nano-multimodal-input</span>'
  // }

  // Implementation of abstract members from BaseApiPageComponent
  public apiName = 'LanguageModel';
  public apiFlagName = 'chrome://flags/#prompt-api-for-gemini-nano-multimodal-input';

  get checkAvailabilityCode(): string {
    return `// TODO: Implement checkAvailabilityCode for AudioMultimodalPromptComponent`;
  }

  get executeCode(): string {
    return `// TODO: Implement executeCode for AudioMultimodalPromptComponent`;
  }

  async checkAvailability(): Promise<void> {
    console.log('checkAvailability called in AudioMultimodalPromptComponent');
    // Example: Check if the 'LanguageModel' API is available on the window object
    if (typeof (window as any).LanguageModel === 'undefined') {
      this.availabilityStatus = AvailabilityStatusEnum.NotAvailable;
      this.availabilityError = new Error('LanguageModel API is not available. Please ensure the feature flag is enabled.');
    } else {
      this.availabilityStatus = AvailabilityStatusEnum.Available;
    }
  }

  async execute(): Promise<void> {
    console.log('execute called in AudioMultimodalPromptComponent');
    this.status = TaskStatus.InProgress; // Example status
    // TODO: Implement actual execution logic
    this.status = TaskStatus.Completed; // Example status
  }

  // <editor-fold desc="Audio From URL Collapsed">
  private _audioFromUrlCollapsed = false;

  get audioFromUrlCollapsed(): boolean {
    return this._audioFromUrlCollapsed;
  }

  set audioFromUrlCollapsed(value: boolean) {
    this._audioFromUrlCollapsed = value;

    this.router.navigate(['.'], { relativeTo: this.route, queryParams: { audioUrlCollapsed: value}, queryParamsHandling: 'merge' });
  }
  // </editor-fold>

  // <editor-fold desc="Audio From Files Collapsed">
  private _audioFromFilesCollapsed = false;

  get audioFromFilesCollapsed(): boolean {
    return this._audioFromFilesCollapsed;
  }

  set audioFromFilesCollapsed(value: boolean) {
    this._audioFromFilesCollapsed = value;

    this.router.navigate(['.'], { relativeTo: this.route, queryParams: { audioFilesCollapsed: value}, queryParamsHandling: 'merge' });
  }
  // </editor-fold>

// <editor-fold desc="Audio From Files Collapsed">
  private _audioFromMicrophoneCollapsed = false;

  get audioFromMicrophoneCollapsed(): boolean {
    return this._audioFromMicrophoneCollapsed;
  }

  set audioFromMicrophoneCollapsed(value: boolean) {
    this._audioFromMicrophoneCollapsed = value;

    this.router.navigate(['.'], { relativeTo: this.route, queryParams: { audioMicrophoneCollapsed: value}, queryParamsHandling: 'merge' });
  }
  // </editor-fold>

  constructor(
    @Inject(DOCUMENT) document: Document, // Removed private platformId from here
    @Inject(PLATFORM_ID) platformId: Object, // Added platformId injection for super
    router: Router, // No longer private readonly, passed to super
    route: ActivatedRoute, // No longer private readonly, passed to super
    titleService: Title, // Renamed from title to titleService
  ) {
    super(document, platformId, titleService, router, route); // Updated super call
  }

  override ngOnInit() {
    super.ngOnInit(); // Call to super.ngOnInit() which handles checkRequirements

    this.setTitle("Audio Prompt API (Experimental) | AI Playground");

    // this.checkRequirements(); // Removed, handled by BaseApiPageComponent

    this.subscriptions.push(this.route.queryParams.subscribe((params) => {
      if (params["audioUrlCollapsed"]) {
        this.audioFromUrlCollapsed = params["audioUrlCollapsed"] === 'true';
      }

      if (params["audioFilesCollapsed"]) {
        this.audioFromFilesCollapsed = params["audioFilesCollapsed"] === 'true';
      }

      if (params["audioMicrophoneCollapsed"]) {
        this.audioFromMicrophoneCollapsed = params["audioMicrophoneCollapsed"] === 'true';
      }
    }))
  }

  // checkRequirements() is removed, functionality inherited from BaseApiPageComponent
  // checkRequirements() {
  //   if (isPlatformBrowser(this.platformId) && (!this.window || !("LanguageModel" in this.window))) {
  //     this.apiFlag.status = RequirementStatus.Fail;
  //     this.apiFlag.message = "'LanguageModel' is not defined. Activate the flag.";
  //   } else if (isPlatformBrowser(this.platformId)) {
  //     this.apiFlag.status = RequirementStatus.Pass;
  //     this.apiFlag.message = "Passed";
  //   }
  // }
}
