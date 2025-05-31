import {Injectable} from '@angular/core';
import {PerformanceMetricEnum} from '../../app/enums/performance-metric.enum';
import {BehaviorSubject, Observable, Subject, Subscriber, Subscription} from 'rxjs';
import {InferenceExecutionResult} from '../interfaces/inference-execution-result';

@Injectable({
  providedIn: 'root'
})
export class InferencePerformanceManager {
  interval: any;

  result!: InferenceExecutionResult;

  resetSubscribers: Subject<void> = new Subject();

  updateSubscribers = new BehaviorSubject<InferenceExecutionResult | undefined>(undefined);

  completionSubscribers: Subject<InferenceExecutionResult> = new Subject();

  constructor() {
    const observer = new PerformanceObserver((list, observer) => {
      let receivedInferenceEnded = false;

      list.getEntries().forEach(entry => {
        switch (entry.name as PerformanceMetricEnum) {
          case PerformanceMetricEnum.SessionCreationStarted:
            this.result.sessionCreationStart = entry.startTime;
            this.result.sessionCreationStartedAt = new Date(performance.timeOrigin + entry.startTime);
            break

          case PerformanceMetricEnum.SessionCreationEnded:
            this.result.sessionCreationEnd = entry.startTime;
            this.result.sessionCreationEndedAt = new Date(performance.timeOrigin + entry.startTime);
            break;

          case PerformanceMetricEnum.SessionCreationDuration:
            this.result.sessionCreationDuration = Math.round(entry.duration);
            break;

          case PerformanceMetricEnum.InferenceStarted:
            this.result.inferenceStart = entry.startTime;
            this.result.inferenceStartedAt = new Date(performance.timeOrigin + entry.startTime);
            break

          case PerformanceMetricEnum.InferenceEnded:
            this.result.inferenceEnd = entry.startTime;
            this.result.inferenceEndedAt = new Date(performance.timeOrigin + entry.startTime);
            receivedInferenceEnded = true;
            break;

          case PerformanceMetricEnum.InferenceDuration:
            this.result.inferenceDuration = Math.round(entry.duration);
            break;

          case PerformanceMetricEnum.DownloadStarted:
            this.result.downloadStart = entry.startTime;
            this.result.downloadStartedAt = new Date(performance.timeOrigin + entry.startTime);
            break

          case PerformanceMetricEnum.DownloadEnded:
            this.result.downloadEnd = entry.startTime;
            this.result.downloadEndedAt = new Date(performance.timeOrigin + entry.startTime);
            break;

          case PerformanceMetricEnum.DownloadDuration:
            this.result.downloadDuration = Math.round(entry.duration);
            break;

          case PerformanceMetricEnum.TokenReceived:
            this.result.tokensReceived.push(entry.startTime);
            break;

          default:
            break;
        }
      })

      this.updateSubscribers.next(this.result);

      if(receivedInferenceEnded) {
        this.completionSubscribers.next(this.result);
      }
    });

    observer.observe({
      entryTypes: ["measure", "mark"],
    })
  }

  reset() {
    performance.clearMeasures()
    performance.clearMarks()

    this.resetSubscribers.next();
  }

  start() {
    this.reset();

    this.result = new InferenceExecutionResult();
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

    // CompletionSubscribers is notified in the observer once it has fully completed processing.
  }

  tokenReceived() {
    performance.mark(PerformanceMetricEnum.TokenReceived)
  }

}
