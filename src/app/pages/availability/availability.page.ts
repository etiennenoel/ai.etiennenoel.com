import {Component, Inject, Input, OnInit, DOCUMENT, PLATFORM_ID} from '@angular/core';
import {ToastStore} from '../../stores/toast.store';

import {ToastMessageInterface} from '../../interfaces/toast-message.interface';
import {delay, pipe} from 'rxjs';
import {BasePageComponent} from '../../components/base/base-page.component';
import {Title} from '@angular/platform-browser';
import {isPlatformServer} from '@angular/common';

@Component({
  selector: 'page-availability',
  templateUrl: './availability.page.html',
  standalone: false,
  styleUrl: './availability.page.scss'
})
export class AvailabilityPage extends BasePageComponent implements OnInit {

  promptAvailability: 'loading' | 'downloadable' | 'unavailable' | 'available' | 'downloading' = 'loading'

  promptError?: string;

  constructor(
    @Inject(PLATFORM_ID) private readonly platformId: Object,
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
    if(isPlatformServer(this.platformId)) {
      return;
    }

    try {
      // @ts-expect-error
      this.promptAvailability = await LanguageModel.availability();
    } catch (e: any) {
      this.promptError = e;
    }
  }
}
