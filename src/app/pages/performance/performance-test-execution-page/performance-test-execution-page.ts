import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-performance-test-execution-page',
  standalone: false,
  templateUrl: './performance-test-execution-page.html',
  styleUrl: './performance-test-execution-page.scss'
})
export class PerformanceTestExecutionPage implements OnInit {
  public testSeriesId: string | null = null;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.testSeriesId = params.get('testSeries');
    });
  }
}
