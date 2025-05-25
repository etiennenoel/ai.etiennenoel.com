import {Injectable} from '@angular/core';
import {ExecutionPerformanceResultModel} from '../models/execution-performance-result.model';
import {ExecutionPerformanceManager} from './execution-performance.manager';
import {Subscription} from 'rxjs';

@Injectable()
export class PerformanceResultManager {
  protected subscription?: Subscription;

  constructor(private readonly executionPerformanceManager: ExecutionPerformanceManager) {
  }

  trackAndSavePerformanceResults() {
    this.subscription = this.executionPerformanceManager.completionSubscribers.subscribe(value => {
      this.save(value);
    })
  }

  list(): ExecutionPerformanceResultModel[] {
    return [];
  }

  async save(executionPerformanceResult: ExecutionPerformanceResultModel) {
    // Save it into Cache Storage
    const cache = await caches.open("performance-results");

    // transform date into human readable format
    const id = `${executionPerformanceResult.api}-${executionPerformanceResult.createdAt.toISOString().replaceAll(":", "_")}`;

    await cache.put(id, new Response(JSON.stringify(executionPerformanceResult)));
  }
}
