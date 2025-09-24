import {Component, Inject, Input, OnInit, DOCUMENT} from '@angular/core';
import {ToastStore} from '../../stores/toast.store';

import {ToastMessageInterface} from '../../interfaces/toast-message.interface';
import {delay, pipe} from 'rxjs';
import {BasePageComponent} from '../../components/base/base-page.component';
import {Title} from '@angular/platform-browser';

@Component({
  selector: 'page-availability',
  templateUrl: './availability.page.html',
  standalone: false,
  styleUrl: './availability.page.scss'
})
export class AvailabilityPage extends BasePageComponent implements OnInit {

  promptAvailability: 'loading' | 'downloadable' | 'unavailable' | 'available' | 'downloading' = 'downloadable'

  promptError?: string;

  constructor(
    @Inject(DOCUMENT) document: Document,
    title: Title,
  ) {
    super(document, title);
  }

  override ngOnInit() {
    super.ngOnInit();

    this.checkPromptAvailability();
  }

  async checkPromptAvailability() {
    try {
      // @ts-expect-error
      this.promptAvailability = await LanguageModel.availability();
    } catch (e: any) {
      this.promptError = e;
    }
  }
}
