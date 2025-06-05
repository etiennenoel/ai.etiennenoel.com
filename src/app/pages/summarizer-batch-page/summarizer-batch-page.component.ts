import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { BaseComponent } from '../../components/base/base.component'; // Assuming a base component exists
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-summarizer-batch-page',
  templateUrl: './summarizer-batch-page.component.html',
  styleUrls: ['./summarizer-batch-page.component.scss'],
  standalone: false, // Explicitly set standalone to false
})
export class SummarizerBatchPageComponent extends BaseComponent implements OnInit {

  constructor(
    @Inject(DOCUMENT) document: Document,
    @Inject(PLATFORM_ID) private platformId: Object,
    protected readonly router: Router,
    protected readonly route: ActivatedRoute,
    protected readonly title: Title
  ) {
    super(document);
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.title.setTitle('Summarizer Batch Page');
    // Basic initialization logic here if needed
  }
}
