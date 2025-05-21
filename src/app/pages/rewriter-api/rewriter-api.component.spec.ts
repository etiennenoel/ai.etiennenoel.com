import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Router, ActivatedRoute, convertToParamMap } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject, of, Subject } from 'rxjs';

import { RewriterApiComponent } from './rewriter-api.component';
import { TaskStatus } from '../../enums/task-status.enum';
import { RequirementStatus } from '../../enums/requirement-status.enum';
import { AvailabilityStatusEnum } from '../../enums/availability-status.enum';
import { RewriterToneEnum } from '../../enums/rewriter-tone.enum';
import { RewriterFormatEnum } from '../../enums/rewriter-format.enum';
import { RewriterLengthEnum } from '../../enums/rewriter-length.enum';
import { LocaleEnum } from '../../enums/locale.enum';

// Mock the global Rewriter object
// @ts-ignore
const mockRewriterInstance = {
  rewrite: jasmine.createSpy('rewrite').and.returnValue(Promise.resolve('Mocked rewrite output')),
  rewriteStreaming: jasmine.createSpy('rewriteStreaming').and.callFake(async function* () {
    yield 'Mocked stream chunk 1';
    yield 'Mocked stream chunk 2';
  })
};
// @ts-ignore
const mockRewriter = {
  availability: jasmine.createSpy('availability').and.returnValue(Promise.resolve(AvailabilityStatusEnum.Available)),
  create: jasmine.createSpy('create').and.returnValue(Promise.resolve(mockRewriterInstance)),
};

describe('RewriterApiComponent', () => {
  let component: RewriterApiComponent;
  let fixture: ComponentFixture<RewriterApiComponent>;
  let mockRouter: Router;
  let mockActivatedRoute: ActivatedRoute;
  let mockTitleService: jasmine.SpyObj<Title>;
  let mockPlatformId: Object;

  const queryParamsSubject = new BehaviorSubject(convertToParamMap({}));

  beforeEach(async () => {
    mockTitleService = jasmine.createSpyObj('Title', ['setTitle']);
    mockPlatformId = 'browser';

    // @ts-ignore
    (window as any).Rewriter = mockRewriter;

    await TestBed.configureTestingModule({
      declarations: [RewriterApiComponent],
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

    fixture = TestBed.createComponent(RewriterApiComponent);
    component = fixture.componentInstance;
    mockRouter = TestBed.inject(Router);
    spyOn(mockRouter, 'navigate');
    mockRewriter.availability.calls.reset();
    mockRewriter.create.calls.reset();
    mockRewriterInstance.rewrite.calls.reset();
    mockRewriterInstance.rewriteStreaming.calls.reset();
  });

  afterEach(() => {
    // @ts-ignore
    delete (window as any).Rewriter;
  });

  it('should create', () => {
    fixture.detectChanges(); // ngOnInit
    expect(component).toBeTruthy();
  });

  describe('Initialization (ngOnInit)', () => {
    it('should set title, call checkRequirements, and set outputCollapsed', () => {
      fixture.detectChanges();
      expect(mockTitleService.setTitle).toHaveBeenCalledWith('Rewriter API | AI Playground');
      spyOn(component, 'checkRequirements').and.callThrough();
      component.ngOnInit();
      expect(component.checkRequirements).toHaveBeenCalled();
      expect(component.outputCollapsed).toBe(true); // As set in ngOnInit
    });

    it('should subscribe to queryParams and set form controls', fakeAsync(() => {
      queryParamsSubject.next(convertToParamMap({
        input: 'test input',
        context: 'test context',
        rewriterTone: RewriterToneEnum.Formal,
        rewriterFormat: RewriterFormatEnum.Email,
        rewriterLength: RewriterLengthEnum.Shorter,
        expectedInputLanguages: LocaleEnum.EnUs,
        // Add other relevant query params for BaseWritingAssistance properties
      }));
      fixture.detectChanges();
      tick();
      expect(component.inputFormControl.value).toBe('test input');
      expect(component.contextFormControl.value).toBe('test context');
      expect(component.toneFormControl.value).toBe(RewriterToneEnum.Formal);
      expect(component.formatFormControl.value).toBe(RewriterFormatEnum.Email);
      expect(component.lengthFormControl.value).toBe(RewriterLengthEnum.Shorter);
      expect(component.expectedInputLanguagesFormControl.value).toEqual([LocaleEnum.EnUs]);
    }));

    it('should update queryParams on toneFormControl change', fakeAsync(() => {
      fixture.detectChanges();
      component.toneFormControl.setValue(RewriterToneEnum.Casual);
      tick();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['.'], jasmine.objectContaining({ queryParams: { rewriterTone: RewriterToneEnum.Casual } }));
    }));
    // Similar tests for format, length, input, context, languages etc.
  });

  describe('checkRequirements', () => {
    it('should set apiFlag to Pass if Rewriter is available', () => {
      component.platformId = 'browser';
      // @ts-ignore
      (window as any).Rewriter = {};
      component.checkRequirements();
      expect(component.apiFlag.status).toBe(RequirementStatus.Pass);
    });

    it('should set apiFlag to Fail if Rewriter is not available', () => {
      component.platformId = 'browser';
      // @ts-ignore
      delete (window as any).Rewriter;
      component.checkRequirements();
      expect(component.apiFlag.status).toBe(RequirementStatus.Fail);
    });
  });

  describe('checkAvailability', () => {
    it('should call Rewriter.availability and update status', async () => {
      mockRewriter.availability.and.returnValue(Promise.resolve(AvailabilityStatusEnum.Available));
      await component.checkAvailability();
      expect(mockRewriter.availability).toHaveBeenCalled();
      expect(component.availabilityStatus).toBe(AvailabilityStatusEnum.Available);
      expect(component.error).toBeUndefined();
    });

    it('should handle Rewriter.availability rejection', async () => {
      const err = new Error('Availability failed');
      mockRewriter.availability.and.returnValue(Promise.reject(err));
      await component.checkAvailability();
      expect(component.availabilityStatus).toBe(AvailabilityStatusEnum.Unavailable);
      expect(component.availabilityError).toBe(err); // Local error for availability
      expect(component.error).toBe(err); // Inherited general error
    });
  });

  describe('rewrite', () => {
    beforeEach(() => {
      component.inputFormControl.setValue('Test input for rewrite');
      fixture.detectChanges(); // ngOnInit
    });

    it('should call Rewriter.create and instance.rewrite (non-streaming)', async () => {
      component.useStreamingFormControl.setValue(false);
      await component.rewrite();

      expect(mockRewriter.create).toHaveBeenCalled();
      expect(mockRewriterInstance.rewrite).toHaveBeenCalledWith('Test input for rewrite', jasmine.objectContaining({
        context: component.contextFormControl.value,
        signal: component.abortController.signal
      }));
      expect(component.status).toBe(TaskStatus.Completed);
      expect(component.output).toBe('Mocked rewrite output');
      expect(component.outputCollapsed).toBe(false);
      expect(component.executionPerformance.totalTime).toBeGreaterThanOrEqual(0);
    });

    it('should call Rewriter.create and instance.rewriteStreaming (streaming)', async () => {
      component.useStreamingFormControl.setValue(true);
      await component.rewrite();

      expect(mockRewriter.create).toHaveBeenCalled();
      expect(mockRewriterInstance.rewriteStreaming).toHaveBeenCalledWith('Test input for rewrite', jasmine.objectContaining({
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
      (window as any).Rewriter.create.and.callFake(async (options: any) => {
        if (options.monitor) {
          const mockMonitorTarget = new EventTarget();
          options.monitor(mockMonitorTarget);
          const progressEvent = new CustomEvent("downloadprogress", {});
          // @ts-ignore
          progressEvent.loaded = 0.75;
          mockMonitorTarget.dispatchEvent(progressEvent);
        }
        return Promise.resolve(mockRewriterInstance);
      });

      await component.rewrite();
      expect(component.loaded).toBe(0.75);
    });

    it('should handle error during Rewriter.create', async () => {
      const err = new Error('Create failed');
      mockRewriter.create.and.returnValue(Promise.reject(err));
      await component.rewrite();
      expect(component.status).toBe(TaskStatus.Error);
      expect(component.error).toBe(err);
    });

    it('should handle error during instance.rewrite', async () => {
      const err = new Error('Rewrite failed');
      component.useStreamingFormControl.setValue(false);
      mockRewriterInstance.rewrite.and.returnValue(Promise.reject(err));
      await component.rewrite();
      expect(component.status).toBe(TaskStatus.Error);
      expect(component.error).toBe(err);
    });

    it('should handle error during instance.rewriteStreaming', async () => {
      const err = new Error('Streaming failed');
      component.useStreamingFormControl.setValue(true);
      mockRewriterInstance.rewriteStreaming.and.callFake(async function*() {
        throw err;
      });
      await component.rewrite();
      expect(component.status).toBe(TaskStatus.Error);
      expect(component.error).toBe(err);
    });
  });

  describe('ExecutionPerformance methods', () => {
    it('startExecutionTime should reset times', () => {
      component.executionPerformance.totalTime = 100;
      component.startExecutionTime();
      expect(component.executionPerformance.firstResponseTime).toBe(0);
      expect(component.executionPerformance.totalTime).toBe(0);
    });

    it('lapFirstResponseTime should set firstResponseTime if not already set', fakeAsync(() => {
      component.startExecutionTime();
      tick(50); // Simulate time passing
      component.lapFirstResponseTime();
      expect(component.executionPerformance.firstResponseTime).toBeGreaterThanOrEqual(50);
      const firstTime = component.executionPerformance.firstResponseTime;
      tick(50);
      component.lapFirstResponseTime(); // Should not update if already set
      expect(component.executionPerformance.firstResponseTime).toBe(firstTime);
    }));

    it('stopExecutionTime should set totalTime if started', fakeAsync(() => {
      component.startExecutionTime();
      tick(100);
      component.stopExecutionTime();
      expect(component.executionPerformance.totalTime).toBeGreaterThanOrEqual(100);
      // @ts-ignore access private _startTime
      expect(component._startTime).toBe(0); // Ensure it's reset
    }));

     it('stopExecutionTime should not set totalTime if not started', () => {
      component.executionPerformance.totalTime = 0;
      // @ts-ignore access private _startTime
      component._startTime = 0; // Ensure it's not started
      component.stopExecutionTime();
      expect(component.executionPerformance.totalTime).toBe(0);
    });
  });
});
