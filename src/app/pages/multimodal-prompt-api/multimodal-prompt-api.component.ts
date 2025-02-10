import {Component, Inject, Input, OnInit, PLATFORM_ID} from '@angular/core';
import {ActivatedRoute, Router, RouterOutlet} from "@angular/router";
import {TaskStatus} from '../../enums/task-status.enum';
import {RequirementInterface} from '../../interfaces/requirement.interface';
import {DOCUMENT, isPlatformBrowser} from '@angular/common';
import {Title} from '@angular/platform-browser';
import {BaseComponent} from '../../components/base/base.component';
import {RequirementStatus} from '../../enums/requirement-status.enum';

@Component({
  selector: 'app-multimodal-prompt-api',
  templateUrl: './multimodal-prompt-api.component.html',
  standalone: false,
  styleUrl: './multimodal-prompt-api.component.scss'
})
export class MultimodalPromptApiComponent extends BaseComponent implements OnInit {

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(DOCUMENT) document: Document,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly title: Title,
  ) {
    super(document);
  }

  public apiFlag: RequirementInterface = {
    status: RequirementStatus.Pending,
    message: 'Pending',
    contentHtml: 'Activate <span class="code">chrome://flags/#content-api-for-gemini-nano</span>'
  }

  override ngOnInit() {
    super.ngOnInit();

    this.title.setTitle("Multimodal Prompt API (Experimental) | AI Playground | etiennenoel.com")

    this.checkRequirements()
  }

  checkRequirements() {
    if (isPlatformBrowser(this.platformId) && this.window && !("ai" in this.window)) {
      this.apiFlag.status = RequirementStatus.Fail;
      this.apiFlag.message = "'window.ai' is not defined. Activate the flag.";
    } else if (isPlatformBrowser(this.platformId) && this.window && !("languageModel" in this.window.ai)) {
      this.apiFlag.status = RequirementStatus.Fail;
      this.apiFlag.message = "'window.ai.languageModel' is not defined. Activate the flag.";
    } else {
      this.apiFlag.status = RequirementStatus.Pass;
      this.apiFlag.message = "Passed";
    }
  }
}
