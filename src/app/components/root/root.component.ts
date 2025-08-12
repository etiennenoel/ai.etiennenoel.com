import {Component, Inject, OnInit, PLATFORM_ID} from '@angular/core';
import {RouterOutlet} from "@angular/router";
import {PerformanceResultManager} from '../../managers/performance-result.manager';
import {isPlatformBrowser} from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './root.component.html',
  standalone: false,
  styleUrl: './root.component.scss'
})
export class RootComponent implements OnInit {

  constructor(
    private readonly performanceResultManager: PerformanceResultManager,
    @Inject(PLATFORM_ID) private readonly platformId: Object,

  ) {
  }

  ngOnInit(): void {
    this.performanceResultManager.trackAndSavePerformanceResults();

    if(isPlatformBrowser(this.platformId)) {
      import("pdfjs-dist").then(pdfjsLib => {
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';
      })
    }
  }
}
