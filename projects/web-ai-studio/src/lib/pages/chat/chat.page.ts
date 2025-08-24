import {Component, Inject, OnDestroy, OnInit, PLATFORM_ID} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {DOCUMENT, isPlatformServer} from '@angular/common';
import {Title} from '@angular/platform-browser';
import {ConversationManager, ConversationStateEnum, PromptInputStateEnum, PromptRunOptions} from '@magieno/angular-ai';
import {BasePage} from '../base-page';


@Component({
  selector: 'page-chat',
  templateUrl: './chat.page.html',
  standalone: false,
  styleUrl: './chat.page.scss'
})
export class ChatPage extends BasePage implements OnInit, OnDestroy {
  state: PromptInputStateEnum = PromptInputStateEnum.Ready;


  constructor(
    router: Router,
    route: ActivatedRoute,
    @Inject(DOCUMENT) document: Document,
    @Inject(PLATFORM_ID) private platformId: Object,
    title: Title,
    public readonly conversationManager: ConversationManager,
  ) {
    super(document, title)

    this.setTitle("Web AI Studio")

  }

  override async ngOnInit() {
    super.ngOnInit();
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
