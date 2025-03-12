import {Component, Inject, Input, OnInit, PLATFORM_ID} from '@angular/core';
import {BasePageComponent} from '../../components/base/base-page.component';
import {RequirementInterface} from '../../interfaces/requirement.interface';
import {RequirementStatus} from '../../enums/requirement-status.enum';
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
  }

  checkRequirements() {
    if (isPlatformBrowser(this.platformId) && this.window && !("ai" in this.window)) {
      this.apiFlag.status = RequirementStatus.Fail;
      this.apiFlag.message = "'window.ai' is not defined. Activate the flag.";
    } else if (isPlatformBrowser(this.platformId) && this.window && !("languageModel" in this.window.ai)) {
      this.apiFlag.status = RequirementStatus.Fail;
      this.apiFlag.message = "'window.ai.languageModel' is not defined. Activate the flag.";
    } else if (isPlatformBrowser(this.platformId)) {
      this.apiFlag.status = RequirementStatus.Pass;
      this.apiFlag.message = "Passed";
    }
  }
}
