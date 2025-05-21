import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Router, ActivatedRoute, convertToParamMap } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject, of, Subject } from 'rxjs';

import { SummarizerApiComponent } from './summarizer-api.component';
import { TaskStatus } from '../../enums/task-status.enum';
import { RequirementStatus } from '../../enums/requirement-status.enum';
import { AvailabilityStatusEnum } from '../../enums/availability-status.enum';
import { SummarizerTypeEnum } from '../../enums/summarizer-type.enum';
import { SummarizerFormatEnum } from '../../enums/summarizer-format.enum';
import { SummarizerLengthEnum } from '../../enums/summarizer-length.enum';
import { LocaleEnum } from '../../enums/locale.enum';

// Mock the global Summarizer object
// @ts-ignore
const mockSummarizerInstance = {
  summarize: jasmine.createSpy('summarize').and.returnValue(Promise.resolve('Mocked summarize output')),
  summarizeStreaming: jasmine.createSpy('summarizeStreaming').and.callFake(async function* () {
    yield 'Mocked stream chunk 1';
    yield 'Mocked stream chunk 2';
  })
};
// @ts-ignore
const mockSummarizer = {
  availability: jasmine.createSpy('availability').and.returnValue(Promise.resolve(AvailabilityStatusEnum.Available)),
  create: jasmine.createSpy('create').and.returnValue(Promise.resolve(mockSummarizerInstance)),
};

describe('SummarizerApiComponent', () => {
  let component: SummarizerApiComponent;
  let fixture: ComponentFixture<SummarizerApiComponent>;
  let mockRouter: Router;
  let mockActivatedRoute: ActivatedRoute;
  let mockTitleService: jasmine.SpyObj<Title>;
  let mockPlatformId: Object;

  const queryParamsSubject = new BehaviorSubject(convertToParamMap({}));

  beforeEach(async () => {
    mockTitleService = jasmine.createSpyObj('Title', ['setTitle']);
    mockPlatformId = 'browser';

    // @ts-ignore
    (window as any).Summarizer = mockSummarizer;

    await TestBed.configureTestingModule({
      declarations: [SummarizerApiComponent],
      imports: [
        FormsModule,
        ReactiveFormsModule,
        RouterTestingModule.withRoutes([]),
      ],
      providers: [
        { provide: PLATFORM_ID, useValue: mockPlatformId },
        { provide: DOCUMENT, useValue: document },
        { provide: Title, useValue: mockTitleService },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: queryParamsSubject.asObservable(),
            snapshot: { queryParamMap: convertToParamMap({}) }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SummarizerApiComponent);
    component = fixture.componentInstance;
    mockRouter = TestBed.inject(Router);
    spyOn(mockRouter, 'navigate');
    mockSummarizer.availability.calls.reset();
    mockSummarizer.create.calls.reset();
    mockSummarizerInstance.summarize.calls.reset();
    mockSummarizerInstance.summarizeStreaming.calls.reset();
  });

  afterEach(() => {
    // @ts-ignore
    delete (window as any).Summarizer;
  });

  it('should create', () => {
    fixture.detectChanges(); // ngOnInit
    expect(component).toBeTruthy();
  });

  describe('Initialization (ngOnInit)', () => {
    it('should set title, call checkRequirements, and set outputCollapsed', () => {
      fixture.detectChanges();
      expect(mockTitleService.setTitle).toHaveBeenCalledWith('Summarizer API | AI Playground');
      spyOn(component, 'checkRequirements').and.callThrough();
      component.ngOnInit();
      expect(component.checkRequirements).toHaveBeenCalled();
      expect(component.outputCollapsed).toBe(true);
    });

    it('should subscribe to queryParams and set form controls', fakeAsync(() => {
      queryParamsSubject.next(convertToParamMap({
        input: 'test input summarize',
        summarizerType: SummarizerTypeEnum.Paragraph,
        summarizerFormat: SummarizerFormatEnum.Markdown,
        summarizerLength: SummarizerLengthEnum.Longer,
      }));
      fixture.detectChanges();
      tick();
      expect(component.inputFormControl.value).toBe('test input summarize');
      expect(component.typeFormControl.value).toBe(SummarizerTypeEnum.Paragraph);
      expect(component.formatFormControl.value).toBe(SummarizerFormatEnum.Markdown);
      expect(component.lengthFormControl.value).toBe(SummarizerLengthEnum.Longer);
    }));

    it('should update queryParams on typeFormControl change', fakeAsync(() => {
      fixture.detectChanges();
      component.typeFormControl.setValue(SummarizerTypeEnum.BulletPoints);
      tick();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['.'], jasmine.objectContaining({ queryParams: { summarizerType: SummarizerTypeEnum.BulletPoints } }));
    }));
    // Similar tests for format, length, input, context, languages etc.
  });

  describe('checkRequirements', () => {
    it('should set apiFlag to Pass if Summarizer is available', () => {
      component.platformId = 'browser';
      // @ts-ignore
      (window as any).Summarizer = {};
      component.checkRequirements();
      expect(component.apiFlag.status).toBe(RequirementStatus.Pass);
    });

    it('should set apiFlag to Fail if Summarizer is not available', () => {
      component.platformId = 'browser';
      // @ts-ignore
      delete (window as any).Summarizer;
      component.checkRequirements();
      expect(component.apiFlag.status).toBe(RequirementStatus.Fail);
    });
  });

  describe('checkAvailability', () => {
    it('should call Summarizer.availability and update status', async () => {
      mockSummarizer.availability.and.returnValue(Promise.resolve(AvailabilityStatusEnum.Available));
      await component.checkAvailability();
      expect(mockSummarizer.availability).toHaveBeenCalled();
      expect(component.availabilityStatus).toBe(AvailabilityStatusEnum.Available);
      expect(component.error).toBeUndefined();
    });

    it('should handle Summarizer.availability rejection', async () => {
      const err = new Error('Availability failed');
      mockSummarizer.availability.and.returnValue(Promise.reject(err));
      await component.checkAvailability();
      expect(component.availabilityStatus).toBe(AvailabilityStatusEnum.Unavailable);
      expect(component.availabilityError).toBe(err);
      expect(component.error).toBe(err);
    });
  });

  describe('summarize', () => {
    beforeEach(() => {
      component.inputFormControl.setValue('Test input for summarize');
      fixture.detectChanges(); // ngOnInit
    });

    it('should call Summarizer.create and instance.summarize (non-streaming)', async () => {
      component.useStreamingFormControl.setValue(false);
      await component.summarize();

      expect(mockSummarizer.create).toHaveBeenCalled();
      expect(mockSummarizerInstance.summarize).toHaveBeenCalledWith('Test input for summarize', jasmine.objectContaining({
        context: component.contextFormControl.value,
        signal: component.abortController.signal
      }));
      expect(component.status).toBe(TaskStatus.Completed);
      expect(component.output).toBe('Mocked summarize output');
      expect(component.outputCollapsed).toBe(false);
      expect(component.executionPerformance.totalTime).toBeGreaterThanOrEqual(0);
    });

    it('should call Summarizer.create and instance.summarizeStreaming (streaming)', async () => {
      component.useStreamingFormControl.setValue(true);
      await component.summarize();

      expect(mockSummarizer.create).toHaveBeenCalled();
      expect(mockSummarizerInstance.summarizeStreaming).toHaveBeenCalledWith('Test input for summarize', jasmine.objectContaining({
        context: component.contextFormControl.value,
        signal: component.abortController.signal
      }));
      expect(component.status).toBe(TaskStatus.Completed);
      expect(component.output).toBe('Mocked stream chunk 1Mocked stream chunk 2');
      expect(component.outputChunks).toEqual(['Mocked stream chunk 1', 'Mocked stream chunk 2']);
      expect(component.outputCollapsed).toBe(false);
      expect(component.executionPerformance.firstResponseTime).toBeGreaterThanOrEqual(0);
      expect(component.executionPerformance.totalTime).toBeGreaterThanOrEqual(0);
    });
    
    it('should update "loaded" property via monitor callback during create', async () => {
      // @ts-ignore
      (window as any).Summarizer.create.and.callFake(async (options: any) => {
        if (options.monitor) {
          const mockMonitorTarget = new EventTarget();
          options.monitor(mockMonitorTarget);
          const progressEvent = new CustomEvent("downloadprogress", {});
          // @ts-ignore
          progressEvent.loaded = 0.65;
          mockMonitorTarget.dispatchEvent(progressEvent);
        }
        return Promise.resolve(mockSummarizerInstance);
      });

      await component.summarize();
      expect(component.loaded).toBe(0.65);
    });

    it('should handle error during Summarizer.create', async () => {
      const err = new Error('Create failed');
      mockSummarizer.create.and.returnValue(Promise.reject(err));
      await component.summarize();
      expect(component.status).toBe(TaskStatus.Error);
      expect(component.error).toBe(err);
    });

    it('should handle error during instance.summarize', async () => {
      const err = new Error('Summarize failed');
      component.useStreamingFormControl.setValue(false);
      mockSummarizerInstance.summarize.and.returnValue(Promise.reject(err));
      await component.summarize();
      expect(component.status).toBe(TaskStatus.Error);
      expect(component.error).toBe(err);
    });

    it('should handle error during instance.summarizeStreaming', async () => {
      const err = new Error('Streaming summarize failed');
      component.useStreamingFormControl.setValue(true);
      mockSummarizerInstance.summarizeStreaming.and.callFake(async function*() {
        throw err;
      });
      await component.summarize();
      expect(component.status).toBe(TaskStatus.Error);
      expect(component.error).toBe(err);
    });
  });

  // Tests for executionPerformance methods would be identical to RewriterApiComponent's tests
  // and are omitted here for brevity but should be included.
  describe('ExecutionPerformance methods', () => {
    it('startExecutionTime should reset times', () => {
      component.executionPerformance.totalTime = 100;
      component.startExecutionTime();
      expect(component.executionPerformance.firstResponseTime).toBe(0);
      expect(component.executionPerformance.totalTime).toBe(0);
    });

    it('lapFirstResponseTime should set firstResponseTime if not already set', fakeAsync(() => {
      component.startExecutionTime();
      tick(50); 
      component.lapFirstResponseTime();
      expect(component.executionPerformance.firstResponseTime).toBeGreaterThanOrEqual(50);
      const firstTime = component.executionPerformance.firstResponseTime;
      tick(50);
      component.lapFirstResponseTime(); 
      expect(component.executionPerformance.firstResponseTime).toBe(firstTime);
    }));

    it('stopExecutionTime should set totalTime if started', fakeAsync(() => {
      component.startExecutionTime();
      tick(100);
      component.stopExecutionTime();
      expect(component.executionPerformance.totalTime).toBeGreaterThanOrEqual(100);
      // @ts-ignore access private _startTime
      expect(component._startTime).toBe(0); 
    }));
  });
});
