import {Component, Inject, Input, OnInit, PLATFORM_ID} from '@angular/core';
import {BasePageComponent} from '../../../components/base/base-page.component';
import {RequirementInterface} from '../../../interfaces/requirement.interface';
import {RequirementStatus} from '../../../enums/requirement-status.enum';
import {DOCUMENT, isPlatformBrowser, isPlatformServer} from '@angular/common';
import {ActivatedRoute, Router} from '@angular/router';
import {Title} from '@angular/platform-browser';
import {FormControl} from '@angular/forms';


@Component({
  selector: 'app-audio-multimodal-prompt',
  templateUrl: './audio-multimodal-prompt.component.html',
  standalone: false,
  styleUrl: './audio-multimodal-prompt.component.scss'
})
export class AudioMultimodalPromptComponent extends BasePageComponent implements OnInit {

  public apiFlag: RequirementInterface = {
    status: RequirementStatus.Pending,
    message: 'Pending',
    contentHtml: 'Activate <span class="code">chrome://flags/#prompt-api-for-gemini-nano-multimodal-input</span>'
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
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(DOCUMENT) document: Document,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    title: Title,
  ) {
    super(document, title);
  }

  override ngOnInit() {
    super.ngOnInit();

    this.setTitle("Audio Prompt API (Experimental) | AI Playground");

    this.checkRequirements();

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

  checkRequirements() {
    if (isPlatformBrowser(this.platformId) && (!this.window || !("LanguageModel" in this.window))) {
      this.apiFlag.status = RequirementStatus.Fail;
      this.apiFlag.message = "'LanguageModel' is not defined. Activate the flag.";
    } else if (isPlatformBrowser(this.platformId)) {
      this.apiFlag.status = RequirementStatus.Pass;
      this.apiFlag.message = "Passed";
    }
  }
}
