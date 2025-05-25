import {Component, OnInit} from '@angular/core';
import {RouterOutlet} from "@angular/router";
import {PerformanceResultManager} from '../../managers/performance-result.manager';

@Component({
  selector: 'app-root',
  templateUrl: './root.component.html',
  standalone: false,
  styleUrl: './root.component.scss'
})
export class RootComponent implements OnInit {

  constructor(private readonly performanceResultManager: PerformanceResultManager) {
  }

  ngOnInit(): void {
    this.performanceResultManager.trackAndSavePerformanceResults();
  }
}
