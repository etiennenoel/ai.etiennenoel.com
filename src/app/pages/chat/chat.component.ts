import {Component, Inject, OnDestroy, OnInit, PLATFORM_ID} from '@angular/core';
import {BasePageComponent} from '../../components/base/base-page.component';
import {ActivatedRoute, Router} from '@angular/router';
import {DOCUMENT} from '@angular/common';
import {Title} from '@angular/platform-browser';
import {ExecutionPerformanceManager} from '../../managers/execution-performance.manager';
import {ConversationManager, ConversationStateEnum, PromptInputStateEnum, PromptRunOptions} from '@magieno/angular-ai';

@Component({
  selector: 'page-chat',
  templateUrl: './chat.component.html',
  standalone: false,
  styleUrl: './chat.component.scss'
})
export class ChatComponent extends BasePageComponent implements OnInit, OnDestroy {
  state: PromptInputStateEnum = PromptInputStateEnum.Ready;

  constructor(
    router: Router,
    route: ActivatedRoute,
    @Inject(DOCUMENT) document: Document,
    @Inject(PLATFORM_ID) private platformId: Object,
    title: Title,
    public readonly executionPerformanceManager: ExecutionPerformanceManager,
    public readonly conversationManager: ConversationManager,
  ) {
    super(document, title)

    this.setTitle("Web AI Studio | AI Playground")

  }

  async onRun(options: PromptRunOptions) {
    await this.conversationManager.run(options);
    this.state = PromptInputStateEnum.Ready;
  }

  onCancel() {
    this.conversationManager.cancel();
  }

  protected readonly ConversationStateEnum = ConversationStateEnum;
}
