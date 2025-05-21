import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Router, ActivatedRoute, convertToParamMap } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject, Subject, of } from 'rxjs';

import { LanguageDetectorComponent } from './language-detector.component';
import { TaskStatus } from '../../enums/task-status.enum';
import { RequirementStatus } from '../../enums/requirement-status.enum';
import { AvailabilityStatusEnum } from '../../enums/availability-status.enum';
import { LocaleEnum } from '../../enums/locale.enum';

// Mock the global LanguageDetector object
// @ts-ignore
const mockLanguageDetector = {
  availability: jasmine.createSpy('availability').and.returnValue(Promise.resolve(AvailabilityStatusEnum.Available)),
  create: jasmine.createSpy('create').and.returnValue(Promise.resolve({
    detect: jasmine.createSpy('detect').and.returnValue(Promise.resolve([{ detectedLanguage: 'en', confidence: 0.9 }])),
  })),
};

describe('LanguageDetectorComponent', () => {
  let component: LanguageDetectorComponent;
  let fixture: ComponentFixture<LanguageDetectorComponent>;
  let mockRouter: Router;
  let mockActivatedRoute: ActivatedRoute;
  let mockTitleService: jasmine.SpyObj<Title>;
  let mockPlatformId: Object;
  let mockDocument: Document;

  // Helper to set query params
  const queryParamsSubject = new BehaviorSubject(convertToParamMap({}));

  beforeEach(async () => {
    mockTitleService = jasmine.createSpyObj('Title', ['setTitle']);
    mockPlatformId = 'browser'; // Default to browser

    // @ts-ignore
    (window as any).LanguageDetector = mockLanguageDetector;


    await TestBed.configureTestingModule({
      declarations: [LanguageDetectorComponent],
      imports: [
        FormsModule,
        ReactiveFormsModule,
        RouterTestingModule.withRoutes([]), // Basic router testing setup
      ],
      providers: [
        { provide: PLATFORM_ID, useValue: mockPlatformId },
        { provide: DOCUMENT, useValue: document },
        { provide: Title, useValue: mockTitleService },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: queryParamsSubject.asObservable(),
            snapshot: { queryParamMap: convertToParamMap({}) } // Provide a default snapshot
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LanguageDetectorComponent);
    component = fixture.componentInstance;
    mockRouter = TestBed.inject(Router);
    mockActivatedRoute = TestBed.inject(ActivatedRoute);
    spyOn(mockRouter, 'navigate'); // Spy on router navigation
  });

  afterEach(() => {
    // @ts-ignore
    delete (window as any).LanguageDetector; // Clean up global mock
    mockLanguageDetector.availability.calls.reset();
    mockLanguageDetector.create.calls.reset();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization (ngOnInit)', () => {
    it('should set title', () => {
      fixture.detectChanges(); // ngOnInit
      expect(mockTitleService.setTitle).toHaveBeenCalledWith('Language Detector API | AI Playground');
    });

    it('should call checkRequirements', () => {
      spyOn(component, 'checkRequirements');
      fixture.detectChanges(); // ngOnInit
      expect(component.checkRequirements).toHaveBeenCalled();
    });
    
    it('should initialize outputCollapsed to true (overriding BasePageComponent default)', () => {
      fixture.detectChanges(); // ngOnInit
      expect(component.outputCollapsed).toBe(true);
    });

    it('should subscribe to queryParams and set inputFormControl', fakeAsync(() => {
      queryParamsSubject.next(convertToParamMap({ input: 'test input' }));
      fixture.detectChanges(); // ngOnInit
      tick();
      expect(component.inputFormControl.value).toBe('test input');
    }));

    it('should subscribe to queryParams and set expectedInputLanguages (single)', fakeAsync(() => {
      queryParamsSubject.next(convertToParamMap({ expectedInputLanguages: LocaleEnum.EnUs }));
      fixture.detectChanges(); // ngOnInit
      tick();
      expect(component.expectedInputLanguages).toEqual([LocaleEnum.EnUs]);
    }));

    it('should subscribe to queryParams and set expectedInputLanguages (array)', fakeAsync(() => {
      queryParamsSubject.next(convertToParamMap({ expectedInputLanguages: [LocaleEnum.EnUs, LocaleEnum.FrFr] }));
      fixture.detectChanges(); // ngOnInit
      tick();
      expect(component.expectedInputLanguages).toEqual([LocaleEnum.EnUs, LocaleEnum.FrFr]);
    }));

    it('should update queryParams on inputFormControl change', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      component.inputFormControl.setValue('new text');
      tick(); // Allow valueChanges to emit
      expect(mockRouter.navigate).toHaveBeenCalledWith(['.'], {
        relativeTo: mockActivatedRoute,
        queryParams: { input: 'new text' },
        queryParamsHandling: 'merge'
      });
    }));

    it('should update queryParams on expectedInputLanguagesFormControl change', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      component.expectedInputLanguagesFormControl.setValue([LocaleEnum.EsEs]);
      tick(); // Allow valueChanges to emit
      expect(mockRouter.navigate).toHaveBeenCalledWith(['.'], {
        relativeTo: mockActivatedRoute,
        queryParams: { expectedInputLanguages: [LocaleEnum.EsEs] },
        queryParamsHandling: 'merge'
      });
    }));
  });

  describe('checkRequirements', () => {
    it('should set apiFlag to Pass if LanguageDetector is available in browser', () => {
      component.platformId = 'browser';
      // @ts-ignore
      (window as any).LanguageDetector = {}; // Mock presence
      component.checkRequirements();
      expect(component.apiFlag.status).toBe(RequirementStatus.Pass);
    });

    it('should set apiFlag to Fail if LanguageDetector is not available in browser', () => {
      component.platformId = 'browser';
      // @ts-ignore
      delete (window as any).LanguageDetector;
      component.checkRequirements();
      expect(component.apiFlag.status).toBe(RequirementStatus.Fail);
    });

    it('should not change apiFlag status if not in browser (pass or fail)', () => {
      component.platformId = 'server';
      component.apiFlag.status = RequirementStatus.Pending; // Initial state
      component.checkRequirements();
      // In a server context, it shouldn't try to access window.LanguageDetector
      // The base class might set it to pending or keep its current state.
      // For this component, it remains Pending as per its logic for non-browser.
      expect(component.apiFlag.status).toBe(RequirementStatus.Pending);
    });
  });

  describe('checkAvailability', () => {
    beforeEach(() => {
      component.platformId = 'browser';
      // @ts-ignore
      (window as any).LanguageDetector = mockLanguageDetector;
    });

    it('should call LanguageDetector.availability and update status on success', async () => {
      mockLanguageDetector.availability.and.returnValue(Promise.resolve(AvailabilityStatusEnum.Available));
      await component.checkAvailability();
      expect(mockLanguageDetector.availability).toHaveBeenCalledWith({
        expectedInputLanguages: component.expectedInputLanguagesFormControl.value
      });
      expect(component.status).toBe(TaskStatus.Completed);
      expect(component.availabilityStatus).toBe(AvailabilityStatusEnum.Available);
      expect(component.error).toBeUndefined();
    });

    it('should set status to Error and update error property on failure', async () => {
      const testError = new Error('Test availability error');
      mockLanguageDetector.availability.and.returnValue(Promise.reject(testError));
      await component.checkAvailability();
      expect(component.status).toBe(TaskStatus.Error);
      expect(component.error).toBe(testError);
      expect(component.availabilityStatus).toBe(AvailabilityStatusEnum.No);
    });
  });

  describe('detect', () => {
    let mockDetectorInstance: { detect: jasmine.Spy };

    beforeEach(async () => {
      component.platformId = 'browser';
      mockDetectorInstance = {
        detect: jasmine.createSpy('detect').and.returnValue(Promise.resolve([{ detectedLanguage: 'en', confidence: 0.9 }]))
      };
      // @ts-ignore
      (window as any).LanguageDetector = {
        ...mockLanguageDetector, // Keep availability spy
        create: jasmine.createSpy('create').and.returnValue(Promise.resolve(mockDetectorInstance))
      };
      component.inputFormControl.setValue('Hello world');
      fixture.detectChanges(); // To init languageModel via ngOnInit
      await fixture.whenStable(); // Ensure languageModel is created if it's async in ngOnInit
    });
    
    it('should call LanguageDetector.create and detector.detect on success', async () => {
      await component.detect();
      // @ts-ignore
      expect(window.LanguageDetector.create).toHaveBeenCalledWith(jasmine.objectContaining({
        expectedInputLanguages: component.expectedInputLanguagesFormControl.value,
        signal: component.abortControllerFromCreate.signal
      }));
      expect(mockDetectorInstance.detect).toHaveBeenCalledWith('Hello world', { signal: component.abortController.signal });
      expect(component.status).toBe(TaskStatus.Completed);
      expect(component.results.length).toBeGreaterThan(0);
      expect(component.results[0].detectedLanguage).toBe('en');
      expect(component.outputCollapsed).toBe(false); // Inherited, should be set by detect
    });

    it('should set status to Error and update error property on LanguageDetector.create failure', async () => {
      const testError = new Error('Create error');
      // @ts-ignore
      window.LanguageDetector.create.and.returnValue(Promise.reject(testError));
      await component.detect();
      expect(component.status).toBe(TaskStatus.Error);
      expect(component.error).toBe(testError);
    });
    
    it('should set status to Error and update error property on detector.detect failure', async () => {
      const testError = new Error('Detect error');
      mockDetectorInstance.detect.and.returnValue(Promise.reject(testError));
      await component.detect();
      expect(component.status).toBe(TaskStatus.Error);
      expect(component.error).toBe(testError);
    });

    it('should update "loaded" property via monitor callback during create', async () => {
      // @ts-ignore
      window.LanguageDetector.create.and.callFake(async (options: any) => {
        if (options.monitor) {
          // Simulate download progress event
          const mockMonitorTarget = new EventTarget();
          options.monitor(mockMonitorTarget); // Pass the target to the monitor
          // Dispatch a fake event
          const progressEvent = new CustomEvent("downloadprogress", { detail: { loaded: 0.5 } });
          // @ts-ignore // patch loaded onto event directly
          progressEvent.loaded = 0.5; 
          mockMonitorTarget.dispatchEvent(progressEvent);
        }
        return Promise.resolve(mockDetectorInstance);
      });

      await component.detect();
      expect(component.loaded).toBe(0.5);
    });
  });
});
