import {Component, Inject, Input, OnInit, DOCUMENT, PLATFORM_ID} from '@angular/core';
import {BasePageComponent} from '../../components/base/base-page.component';
import {Title} from '@angular/platform-browser';
import {isPlatformServer} from '@angular/common';

@Component({
  selector: 'page-availability-creator',
  templateUrl: './availability-creator.page.html',
  standalone: false,
  styleUrl: './availability-creator.page.scss'
})
export class AvailabilityCreatorPage extends BasePageComponent implements OnInit {

  promptAvailability: 'loading' | 'downloadable' | 'unavailable' | 'available' | 'downloading' = 'loading'
  promptError?: string;

  proofreaderAvailability: 'loading' | 'downloadable' | 'unavailable' | 'available' | 'downloading' = 'loading'
  proofreaderError?: string;

  rewriterAvailability: 'loading' | 'downloadable' | 'unavailable' | 'available' | 'downloading' = 'loading'
  rewriterError?: string;

  summarizerAvailability: 'loading' | 'downloadable' | 'unavailable' | 'available' | 'downloading' = 'loading'
  summarizerError?: string;

  writerAvailability: 'loading' | 'downloadable' | 'unavailable' | 'available' | 'downloading' = 'loading'
  writerError?: string;

  promptCreationSuccess?: boolean;
  promptCreationError?: string;

  proofreaderCreationSuccess?: boolean;
  proofreaderCreationError?: string;

  rewriterCreationSuccess?: boolean;
  rewriterCreationError?: string;

  summarizerCreationSuccess?: boolean;
  summarizerCreationError?: string;

  writerCreationSuccess?: boolean;
  writerCreationError?: string;

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
    this.checkProofreaderAvailability();
    this.checkRewriterAvailability();
    this.checkSummarizerAvailability();
    this.checkWriterAvailability();

    this.createPrompt();
    this.createProofreader();
    this.createRewriter();
    this.createSummarizer();
    this.createWriter();
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

  async checkProofreaderAvailability() {
    if(isPlatformServer(this.platformId)) {
      return;
    }

    try {
      // @ts-expect-error
      this.proofreaderAvailability = await Proofreader.availability();
    } catch (e: any) {
      this.proofreaderError = e;
    }
  }

  async checkRewriterAvailability() {
    if(isPlatformServer(this.platformId)) {
      return;
    }

    try {
      // @ts-expect-error
      this.rewriterAvailability = await Rewriter.availability();
    } catch (e: any) {
      this.rewriterError = e;
    }
  }

  async checkSummarizerAvailability() {
    if(isPlatformServer(this.platformId)) {
      return;
    }

    try {
      // @ts-expect-error
      this.summarizerAvailability = await Summarizer.availability();
    } catch (e: any) {
      this.summarizerError = e;
    }
  }

  async checkWriterAvailability() {
    if(isPlatformServer(this.platformId)) {
      return;
    }

    try {
      // @ts-expect-error
      this.writerAvailability = await Writer.availability();
    } catch (e: any) {
      this.writerError = e;
    }
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
