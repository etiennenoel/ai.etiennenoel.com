import { Injectable } from '@angular/core';
import { PerformanceTestResultModel } from '../../performance-test/models/performance-test-result.model';

@Injectable({
  providedIn: 'root'
})
export class PerformanceResultRepository {

  private dbName = 'PerformanceResultsDB';
  private storeName = 'performanceResults';
  private db: IDBDatabase | null = null;

  constructor() {
    this.initDb();
  }

  private async initDb(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = (event) => {
        console.error('Error opening IndexedDB:', event);
        reject('Error opening IndexedDB');
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
          if (!store.indexNames.contains('id')) {
            store.createIndex('id', 'id', { unique: true });
          }
        }
      };
    });
  }

  async create(result: PerformanceTestResultModel): Promise<void> {
    if (!this.db) {
      await this.initDb();
    }
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.add(result);

      request.onsuccess = () => resolve();
      request.onerror = (event) => {
        console.error('Error creating result:', event);
        reject('Error creating result');
      };
    });
  }

  async read(id: string): Promise<PerformanceTestResultModel | null> {
    if (!this.db) {
      await this.initDb();
    }
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(id);

      request.onsuccess = (event) => {
        resolve((event.target as IDBRequest).result || null);
      };
      request.onerror = (event) => {
        console.error('Error reading result:', event);
        reject('Error reading result');
      };
    });
  }

  async update(result: PerformanceTestResultModel): Promise<void> {
    if (!this.db) {
      await this.initDb();
    }
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put(result);

      request.onsuccess = () => resolve();
      request.onerror = (event) => {
        console.error('Error updating result:', event);
        reject('Error updating result');
      };
    });
  }

  async delete(id: string): Promise<void> {
    if (!this.db) {
      await this.initDb();
    }
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = (event) => {
        console.error('Error deleting result:', event);
        reject('Error deleting result');
      };
    });
  }

  async list(): Promise<PerformanceTestResultModel[]> {
    if (!this.db) {
      await this.initDb();
    }
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();

      request.onsuccess = (event) => {
        resolve((event.target as IDBRequest).result || []);
      };
      request.onerror = (event) => {
        console.error('Error listing results:', event);
        reject('Error listing results');
      };
    });
  }
}
