import {Component, Inject, Input, OnInit, DOCUMENT, PLATFORM_ID} from '@angular/core';
import {ToastStore} from '../../stores/toast.store';

import {ToastMessageInterface} from '../../interfaces/toast-message.interface';
import {delay, pipe} from 'rxjs';
import {BasePageComponent} from '../../components/base/base-page.component';
import {Title} from '@angular/platform-browser';
import {isPlatformServer} from '@angular/common';

@Component({
  selector: 'page-creator',
  templateUrl: './creator.page.html',
  standalone: false,
  styleUrl: './creator.page.scss'
})
export class CreatorPage extends BasePageComponent implements OnInit {

  promptCreationSuccess?: boolean;
  promptError?: string;

  proofreaderCreationSuccess?: boolean;
  proofreaderError?: string;

  rewriterCreationSuccess?: boolean;
  rewriterError?: string;

  summarizerCreationSuccess?: boolean;
  summarizerError?: string;

  writerCreationSuccess?: boolean;
  writerError?: string;

  constructor(
    @Inject(PLATFORM_ID) private readonly platformId: Object,
    @Inject(DOCUMENT) document: Document,
    title: Title,
  ) {
    super(document, title);
  }

  override ngOnInit() {
    super.ngOnInit();

    this.createPrompt();
    this.createProofreader();
    this.createRewriter();
    this.createSummarizer();
    this.createWriter();
  }

  async createPrompt() {
    if(isPlatformServer(this.platformId)) {
      return;
    }

    try {
      // @ts-expect-error
      const session = await LanguageModel.create();
      this.promptCreationSuccess = true;
    } catch (e: any) {
      this.promptError = e;
      this.promptCreationSuccess = false;
    }
  }

  async createProofreader() {
    if(isPlatformServer(this.platformId)) {
      return;
    }

    try {
      // @ts-expect-error
      const session = await Proofreader.create();
      this.proofreaderCreationSuccess = true;
    } catch (e: any) {
      this.proofreaderError = e;
      this.proofreaderCreationSuccess = false;
    }
  }

  async createRewriter() {
    if(isPlatformServer(this.platformId)) {
      return;
    }

    try {
      // @ts-expect-error
      const session = await Rewriter.create();
      this.rewriterCreationSuccess = true;
    } catch (e: any) {
      this.rewriterError = e;
      this.rewriterCreationSuccess = false;
    }
  }

  async createSummarizer() {
    if(isPlatformServer(this.platformId)) {
      return;
    }

    try {
      // @ts-expect-error
      const session = await Summarizer.create();
      this.summarizerCreationSuccess = true;
    } catch (e: any) {
      this.summarizerError = e;
      this.summarizerCreationSuccess = false;
    }
  }

  async createWriter() {
    if(isPlatformServer(this.platformId)) {
      return;
    }

    try {
      // @ts-expect-error
      const session = await Writer.create();
      this.writerCreationSuccess = true;
    } catch (e: any) {
      this.writerError = e;
      this.writerCreationSuccess = false;
    }
  }
}
