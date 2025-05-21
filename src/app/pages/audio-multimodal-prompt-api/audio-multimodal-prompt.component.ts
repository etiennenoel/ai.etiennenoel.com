import {Component, Inject, Input, OnInit } from '@angular/core'; // PLATFORM_ID removed from here
import {BasePageComponent} from '../../components/base/base-page.component';
import {RequirementInterface} from '../../interfaces/requirement.interface'; // Keep for local apiFlag
import {RequirementStatus} from '../../enums/requirement-status.enum'; // Keep for local apiFlag
import {DOCUMENT, isPlatformBrowser, isPlatformServer} from '@angular/common'; // Keep for constructor and methods
import {ActivatedRoute, Router} from '@angular/router'; // Keep for constructor
import {Title} from '@angular/platform-browser'; // Keep for constructor
import {FormControl} from '@angular/forms';
// Import PLATFORM_ID for constructor
import { PLATFORM_ID } from '@angular/core';
// Import TaskStatus if needed for checkAvailability, though BasePageComponent provides it.
// For now, assume AvailabilityStatusEnum will be used or a simple status.
import { AvailabilityStatusEnum } from '../../enums/availability-status.enum';


@Component({
  selector: 'app-audio-multimodal-prompt',
  templateUrl: './audio-multimodal-prompt.component.html',
  standalone: false,
  styleUrl: './audio-multimodal-prompt.component.scss'
})
export class AudioMultimodalPromptComponent extends BasePageComponent implements OnInit {

  // Override apiFlag from BasePageComponent
  public override apiFlag: RequirementInterface = {
    status: RequirementStatus.Pending,
    message: 'Pending',
    contentHtml: 'Activate <span class="code">chrome://flags/#prompt-api-for-gemini-nano-multimodal-input</span>'
  };

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
    @Inject(PLATFORM_ID) platformId: object, // Pass to super, remove private
    @Inject(DOCUMENT) document: Document, // Pass to super
    protected override router: Router, // Add protected override, pass to super
    protected override route: ActivatedRoute, // Add protected override, pass to super
    protected override titleService: Title, // Add protected override, rename title, pass to super
  ) {
    super(platformId, document, router, route, titleService);
  }

  override ngOnInit() {
    super.ngOnInit();
    // outputCollapsed is inherited, defaults to false. If true is desired:
    // this.outputCollapsed = true; 

    this.titleService.setTitle("Audio Prompt API (Experimental) | AI Playground"); // Use inherited titleService

    this.checkRequirements(); // Call implemented abstract method

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

  // Implementation of abstract method from BasePageComponent
  override checkRequirements(): void {
    if (isPlatformBrowser(this.platformId) && (!this.window || !("LanguageModel" in this.window))) {
      this.apiFlag.status = RequirementStatus.Fail; // Use overridden apiFlag
      this.apiFlag.message = "'LanguageModel' is not defined. Activate the flag.";
    } else if (isPlatformBrowser(this.platformId)) {
      this.apiFlag.status = RequirementStatus.Pass;
      this.apiFlag.message = "Passed";
    }
  }

  // Implementation of abstract method from BasePageComponent
  override async checkAvailability(): Promise<void> {
    // TODO: Implement actual availability check for Audio Multimodal Prompt API
    // For now, setting to Unknown or NotApplicable as an example.
    // If 'LanguageModel.availability' or a similar check exists, use it here.
    // this.availabilityStatus = AvailabilityStatusEnum.Unknown; // Example
    if (isPlatformBrowser(this.platformId) && this.window && ("LanguageModel" in this.window)) {
        try {
            // Example: const capabilities = await (this.window as any).LanguageModel.availability();
            // Based on capabilities, set this.status or a local availabilityStatus property.
            // For this component, there isn't a specific local 'availabilityStatus' property to set
            // like in other components, so we might just set the main 'status' or rely on checkRequirements.
            // If there's no distinct availability check API apart from the flag,
            // this method might not do much beyond what checkRequirements does.
            // For now, let's assume it's available if requirements are met.
             // this.status = TaskStatus.Available; // Or some other status
        } catch (e: any) {
            this.error = e; // Use inherited error
            // this.status = TaskStatus.Error;
        }
    } else {
        // this.status = TaskStatus.Unavailable; // Or some other status
    }
  }
}
