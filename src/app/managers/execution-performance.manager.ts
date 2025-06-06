import {Injectable} from '@angular/core';
import {BehaviorSubject, Subject} from 'rxjs';
import {ExecutionPerformanceResultModel} from '../models/execution-performance-result.model';
import {BuiltInAiApiEnum} from '../enums/built-in-ai-api.enum';
import {InferencePerformanceManager} from '../../performance-test/managers/inference-performance.manager';

@Injectable({
  providedIn: 'root'
})
export class ExecutionPerformanceManager {
  result!: ExecutionPerformanceResultModel;

  resetSubscribers: Subject<void> = new Subject();
  updateSubscribers = new BehaviorSubject<ExecutionPerformanceResultModel | undefined>(undefined);
  completionSubscribers: Subject<ExecutionPerformanceResultModel> = new Subject();

  constructor(private inferenceManager: InferencePerformanceManager) {
    this.inferenceManager.updateSubscribers.subscribe(inferenceResult => {
      if (this.result && inferenceResult) {
        this.result = Object.assign(this.result, inferenceResult);
      }
      this.updateSubscribers.next(this.result);
    });

    this.inferenceManager.completionSubscribers.subscribe(inferenceResult => {
      if (this.result && inferenceResult) {
        this.result = Object.assign(this.result, inferenceResult);
      }
      this.completionSubscribers.next(this.result);
    });

    this.inferenceManager.resetSubscribers.subscribe(() => {
      this.resetSubscribers.next();
    });
  }

  reset() {
    this.inferenceManager.reset();
    // this.resetSubscribers.next() is called via subscription to inferenceManager.resetSubscribers
    if (this.result) {
      // api will be reset on next call to start()
      this.result.creationOptions = undefined;
      this.result.executionOptions = undefined;
      // Reset other ExecutionPerformanceResultModel specific fields if necessary
    }
  }

  start(api: BuiltInAiApiEnum) {
    this.inferenceManager.start();
    this.result = new ExecutionPerformanceResultModel(api);
    // Optionally, copy initial values from this.inferenceManager.result if relevant
    // For example:
    // if (this.inferenceManager.result) {
    //   this.result.someInitialProperty = this.inferenceManager.result.someInitialProperty;
    // }
  }

  sessionCreationStarted(creationOptions?: any) {
    if (this.result) {
      this.result.creationOptions = creationOptions;
    }
    this.inferenceManager.sessionCreationStarted();
  }

  sessionCreationCompleted() {
    this.inferenceManager.sessionCreationCompleted();
  }

  /**
   * progress: A number from 0 to 1;
   * @param progress
   */
  downloadUpdated(progress: number) {
    this.inferenceManager.downloadUpdated(progress);
  }

  inferenceStarted(executionOptions?: any) {
    if (this.result) {
      this.result.executionOptions = executionOptions;
    }
    this.inferenceManager.inferenceStarted();
  }

  inferenceCompleted() {
    this.inferenceManager.inferenceCompleted();
  }

  tokenReceived() {
    this.inferenceManager.tokenReceived();
  }
}
