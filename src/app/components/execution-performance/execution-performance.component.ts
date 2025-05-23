import {Component, OnInit} from '@angular/core';
import {PerformanceMetricEnum} from '../../enums/performance-metric.enum';

@Component({
  selector: 'app-execution-performance',
  templateUrl: './execution-performance.component.html',
  standalone: false,
  styleUrl: './execution-performance.component.scss'
})
export class ExecutionPerformanceComponent implements OnInit {
  sessionCreationStartedAt?: Date;

  sessionCreationDuration: number = 0;

  sessionCreationEndedAt?: Date;

  inferenceStartedAt?: Date;

  inferenceDuration: number = 0;

  inferenceEndedAt?: Date;

  ngOnInit(): void {
    const observer = new PerformanceObserver((list, observer) => {
      list.getEntries().forEach(entry => {
        switch (entry.name as PerformanceMetricEnum) {
          case PerformanceMetricEnum.SessionCreationStarted:
            this.sessionCreationStartedAt = new Date(performance.timeOrigin + entry.startTime);
            break

          case PerformanceMetricEnum.SessionCreationEnded:
            this.sessionCreationEndedAt = new Date(performance.timeOrigin + entry.startTime);
            break;

          case PerformanceMetricEnum.SessionCreationDuration:
            this.sessionCreationDuration = Math.round(entry.duration);
            break;

          case PerformanceMetricEnum.InferenceStarted:
            this.inferenceStartedAt = new Date(performance.timeOrigin + entry.startTime);
            break

          case PerformanceMetricEnum.InferenceEnded:
            this.inferenceEndedAt = new Date(performance.timeOrigin + entry.startTime);
            break;

          case PerformanceMetricEnum.InferenceDuration:
            this.inferenceDuration = Math.round(entry.duration);
            break;

          default:
            break;

        }
      })
    })

    observer.observe({
      entryTypes: ["measure", "mark"],
    })
  }

}
