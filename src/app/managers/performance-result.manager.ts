import {Inject, Injectable, PLATFORM_ID} from '@angular/core';
import {ExecutionPerformanceResultModel} from '../models/execution-performance-result.model';
import {ExecutionPerformanceManager} from './execution-performance.manager';
import {Subscription} from 'rxjs';
import {isPlatformServer} from '@angular/common';

@Injectable()
export class PerformanceResultManager {
  protected subscription?: Subscription;

  constructor(
    private readonly executionPerformanceManager: ExecutionPerformanceManager,
    @Inject(PLATFORM_ID) private readonly platformId: Object,
  ) {
  }

  trackAndSavePerformanceResults() {
    this.subscription = this.executionPerformanceManager.completionSubscribers.subscribe(value => {
      this.save(value);
    })
  }

  async deleteAll() {
    if (isPlatformServer(this.platformId)) {
      return;
    }

    const cache = await caches.open("performance-results");
    const keys = await cache.keys()
    keys.forEach(key => {
      cache.delete(key);
    })
  }

  async list(): Promise<ExecutionPerformanceResultModel[]> {
    if (isPlatformServer(this.platformId)) {
      return [];
    }

    const cache = await caches.open("performance-results");
    const keys = await cache.keys();

    const results: ExecutionPerformanceResultModel[] = [];

    for (const value of keys) {
      const response = await cache.match(value);

      if (!response) {
        continue;
      }

      let json = await response.json();
      json = Object.assign(new ExecutionPerformanceResultModel(json.api), json);
      json.createdAt = new Date(json.createdAt);

      results.push(json);
    }

    return results.sort((a: ExecutionPerformanceResultModel, b: ExecutionPerformanceResultModel) => {
      return b.createdAt.getTime() - a.createdAt.getTime()
    });
  }

  async save(executionPerformanceResult: ExecutionPerformanceResultModel) {
    // Save it into Cache Storage
    const cache = await caches.open("performance-results");

    // transform date into human readable format
    const id = `${executionPerformanceResult.api}-${executionPerformanceResult.createdAt.toISOString().replaceAll(":", "_")}`;

    await cache.put(id, new Response(JSON.stringify(executionPerformanceResult)));
  }
}
