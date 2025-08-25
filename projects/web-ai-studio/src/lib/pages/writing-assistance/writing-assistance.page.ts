import { Component } from '@angular/core';
import {ConversationStateEnum} from '@magieno/angular-ai';

@Component({
  selector: 'webai-studio-writing-assistance',
  standalone: false,
  templateUrl: './writing-assistance.page.html',
  styleUrl: './writing-assistance.page.scss'
})
export class WritingAssistancePage {

  protected readonly ConversationStateEnum = ConversationStateEnum;
}
