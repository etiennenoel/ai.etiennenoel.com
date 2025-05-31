import { TestBed } from '@angular/core/testing';
import { PerformanceResultRepository } from './performance-result.repository';
import { PerformanceTestResultModel } from '../../performance-test/models/performance-test-result.model';
import { PerformanceTestSeriesEnum } from '../enums/performance-test-series.enum';

describe('PerformanceResultRepository', () => {
  let repository: PerformanceResultRepository;
  let mockDb: any;
  let mockRequest: any;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PerformanceResultRepository]
    });
    repository = TestBed.inject(PerformanceResultRepository);

    // Mock IDBRequest for onsuccess/onerror callbacks
    mockRequest = {
      onsuccess: null,
      onerror: null,
    };

    // Mock IndexedDB
    mockDb = {
      transaction: jest.fn().mockReturnThis(),
      objectStore: jest.fn().mockReturnThis(),
      add: jest.fn().mockReturnValue(mockRequest),
      get: jest.fn().mockReturnValue(mockRequest),
      put: jest.fn().mockReturnValue(mockRequest),
      delete: jest.fn().mockReturnValue(mockRequest),
      getAll: jest.fn().mockReturnValue(mockRequest),
    };
    repository['db'] = mockDb; // Access private member for testing
  });

  it('should be created', () => {
    expect(repository).toBeTruthy();
  });

  describe('create', () => {
    it('should add a result to the database', async () => {
      const result = new PerformanceTestResultModel(PerformanceTestSeriesEnum.SummarizerSmall);
      const promise = repository.create(result);
      // Trigger onsuccess for the mock request
      if (mockRequest.onsuccess) {
        mockRequest.onsuccess();
      }
      await promise;

      expect(mockDb.transaction).toHaveBeenCalledWith(['performanceResults'], 'readwrite');
      expect(mockDb.objectStore).toHaveBeenCalledWith('performanceResults');
      expect(mockDb.add).toHaveBeenCalledWith(result);
    });
  });

  describe('read', () => {
    it('should retrieve a result by ID', async () => {
      const resultId = 'test-id';
      const mockResult = new PerformanceTestResultModel(PerformanceTestSeriesEnum.SummarizerSmall);
      mockResult.id = resultId;

      const promise = repository.read(resultId);
      // Trigger onsuccess for the mock request
      if (mockRequest.onsuccess) {
        mockRequest.onsuccess({ target: { result: mockResult } });
      }
      const result = await promise;

      expect(mockDb.transaction).toHaveBeenCalledWith(['performanceResults'], 'readonly');
      expect(mockDb.objectStore).toHaveBeenCalledWith('performanceResults');
      expect(mockDb.get).toHaveBeenCalledWith(resultId);
      expect(result).toEqual(mockResult);
    });
  });

  describe('update', () => {
    it('should update an existing result', async () => {
      const result = new PerformanceTestResultModel(PerformanceTestSeriesEnum.SummarizerSmall);
      const promise = repository.update(result);
      // Trigger onsuccess for the mock request
      if (mockRequest.onsuccess) {
        mockRequest.onsuccess();
      }
      await promise;

      expect(mockDb.transaction).toHaveBeenCalledWith(['performanceResults'], 'readwrite');
      expect(mockDb.objectStore).toHaveBeenCalledWith('performanceResults');
      expect(mockDb.put).toHaveBeenCalledWith(result);
    });
  });

  describe('delete', () => {
    it('should delete a result by ID', async () => {
      const resultId = 'test-id';
      const promise = repository.delete(resultId);
      // Trigger onsuccess for the mock request
      if (mockRequest.onsuccess) {
        mockRequest.onsuccess();
      }
      await promise;

      expect(mockDb.transaction).toHaveBeenCalledWith(['performanceResults'], 'readwrite');
      expect(mockDb.objectStore).toHaveBeenCalledWith('performanceResults');
      expect(mockDb.delete).toHaveBeenCalledWith(resultId);
    });
  });

  describe('list', () => {
    it('should retrieve all results', async () => {
      const mockResults = [
        new PerformanceTestResultModel(PerformanceTestSeriesEnum.SummarizerSmall),
        new PerformanceTestResultModel(PerformanceTestSeriesEnum.WriterSmall),
      ];

      const promise = repository.list();
      // Trigger onsuccess for the mock request
      if (mockRequest.onsuccess) {
        mockRequest.onsuccess({ target: { result: mockResults } });
      }
      const results = await promise;

      expect(mockDb.transaction).toHaveBeenCalledWith(['performanceResults'], 'readonly');
      expect(mockDb.objectStore).toHaveBeenCalledWith('performanceResults');
      expect(mockDb.getAll).toHaveBeenCalled();
      expect(results).toEqual(mockResults);
    });
  });
});
