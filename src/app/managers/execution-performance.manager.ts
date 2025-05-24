import {Injectable} from '@angular/core';
import {PerformanceMetricEnum} from '../enums/performance-metric.enum';
import {BehaviorSubject, Observable, Subject, Subscriber, Subscription} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ExecutionPerformanceManager {
  interval: any;

  resetSubscribers: Subject<void> = new Subject();

  reset() {
    performance.clearMeasures()
    performance.clearMarks()

    this.resetSubscribers.next();
  }

  sessionCreationStarted() {
    performance.mark(PerformanceMetricEnum.SessionCreationStarted)

    this.interval = setInterval(() => {
      performance.measure(PerformanceMetricEnum.SessionCreationDuration, PerformanceMetricEnum.SessionCreationStarted);
    }, 10);
  }

  sessionCreationCompleted() {
    clearInterval(this.interval);
    performance.mark(PerformanceMetricEnum.SessionCreationEnded);
    performance.measure(PerformanceMetricEnum.SessionCreationDuration, PerformanceMetricEnum.SessionCreationStarted, PerformanceMetricEnum.SessionCreationEnded);
  }

  /**
   * progress: A number from 0 to 1;
   * @param progress
   */
  downloadUpdated(progress: number) {
    if(progress === 0) {
      performance.mark(PerformanceMetricEnum.DownloadStarted);
    }

    performance.measure(PerformanceMetricEnum.DownloadDuration, PerformanceMetricEnum.DownloadStarted);

    if(progress === 1) {
      performance.mark(PerformanceMetricEnum.DownloadEnded)
      performance.measure(PerformanceMetricEnum.DownloadDuration, PerformanceMetricEnum.DownloadStarted, PerformanceMetricEnum.DownloadEnded);
    }
  }


  inferenceStarted() {
    performance.mark(PerformanceMetricEnum.InferenceStarted)

    this.interval = setInterval(() => {
      performance.measure(PerformanceMetricEnum.InferenceDuration, PerformanceMetricEnum.InferenceStarted);
    }, 10);
  }

  inferenceCompleted() {
    clearInterval(this.interval);
    performance.mark(PerformanceMetricEnum.InferenceEnded);
    performance.measure(PerformanceMetricEnum.InferenceDuration, PerformanceMetricEnum.InferenceStarted, PerformanceMetricEnum.InferenceEnded);
  }

  tokenReceived() {
    performance.mark(PerformanceMetricEnum.TokenReceived)
  }

}
