import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Router, ActivatedRoute, convertToParamMap } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject, of } from 'rxjs';

import { TranslatorApiComponent } from './translator-api.component';
import { TaskStatus } from '../../enums/task-status.enum';
import { RequirementStatus } from '../../enums/requirement-status.enum';
import { AvailabilityStatusEnum } from '../../enums/availability-status.enum';
import { LocaleEnum } from '../../enums/locale.enum';

// Mock the global Translator object
// @ts-ignore
const mockTranslatorInstance = {
  translate: jasmine.createSpy('translate').and.returnValue(Promise.resolve('Mocked translated text')),
};
// @ts-ignore
const mockTranslator = {
  availability: jasmine.createSpy('availability').and.returnValue(Promise.resolve(AvailabilityStatusEnum.Available)),
  create: jasmine.createSpy('create').and.returnValue(Promise.resolve(mockTranslatorInstance)),
};

describe('TranslatorApiComponent', () => {
  let component: TranslatorApiComponent;
  let fixture: ComponentFixture<TranslatorApiComponent>;
  let mockRouter: Router;
  let mockActivatedRoute: ActivatedRoute;
  let mockTitleService: jasmine.SpyObj<Title>;
  let mockPlatformId: Object;

  const queryParamsSubject = new BehaviorSubject(convertToParamMap({}));

  beforeEach(async () => {
    mockTitleService = jasmine.createSpyObj('Title', ['setTitle']);
    mockPlatformId = 'browser';

    // @ts-ignore
    (window as any).Translator = mockTranslator;

    await TestBed.configureTestingModule({
      // declarations: [TranslatorApiComponent], // Not needed for standalone components
      imports: [
        FormsModule,
        ReactiveFormsModule,
        RouterTestingModule.withRoutes([]),
        TranslatorApiComponent // Import the standalone component
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

    fixture = TestBed.createComponent(TranslatorApiComponent);
    component = fixture.componentInstance;
    mockRouter = TestBed.inject(Router);
    spyOn(mockRouter, 'navigate');
    mockTranslator.availability.calls.reset();
    mockTranslator.create.calls.reset();
    mockTranslatorInstance.translate.calls.reset();
  });

  afterEach(() => {
    // @ts-ignore
    delete (window as any).Translator;
  });

  it('should create', () => {
    fixture.detectChanges(); // ngOnInit
    expect(component).toBeTruthy();
  });

  describe('Initialization (ngOnInit)', () => {
    it('should set title, call reset (which calls checkRequirements)', () => {
      spyOn(component, 'reset').and.callThrough();
      spyOn(component, 'checkRequirements').and.callThrough();
      fixture.detectChanges();
      expect(mockTitleService.setTitle).toHaveBeenCalledWith('Translator API | AI Playground');
      expect(component.reset).toHaveBeenCalled();
      expect(component.checkRequirements).toHaveBeenCalled();
    });
    
    it('should initialize outputCollapsed to true', () => {
      fixture.detectChanges();
      expect(component.outputCollapsed).toBe(true);
    });

    it('should initialize form controls with default values', () => {
      fixture.detectChanges();
      expect(component.sourceLanguage.value).toBe('en');
      expect(component.targetLanguage.value).toBe('fr');
      expect(component.content.value).toBe('');
    });

    it('should subscribe to queryParams and set form controls', fakeAsync(() => {
      queryParamsSubject.next(convertToParamMap({
        sourceLanguage: LocaleEnum.EsEs,
        targetLanguage: LocaleEnum.DeDe,
        content: 'Hola'
      }));
      fixture.detectChanges(); // ngOnInit calls reset, then subscribes
      tick();
      expect(component.sourceLanguage.value).toBe(LocaleEnum.EsEs);
      expect(component.targetLanguage.value).toBe(LocaleEnum.DeDe);
      expect(component.content.value).toBe('Hola');
    }));

    it('should update queryParams on sourceLanguage change', fakeAsync(() => {
      fixture.detectChanges();
      component.sourceLanguage.setValue(LocaleEnum.ItIt);
      tick();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['.'], jasmine.objectContaining({ queryParams: { sourceLanguage: LocaleEnum.ItIt } }));
    }));
    // Similar tests for targetLanguage and content FormControls
  });

  describe('checkRequirements', () => {
    it('should set apiFlag to Pass if Translator is available', () => {
      component.platformId = 'browser';
      // @ts-ignore
      (window as any).Translator = {};
      component.checkRequirements();
      expect(component.apiFlag.status).toBe(RequirementStatus.Pass);
      expect(component.allRequirementsStatus).toBe(RequirementStatus.Pass);
    });

    it('should set apiFlag to Fail if Translator is not available', () => {
      component.platformId = 'browser';
      // @ts-ignore
      delete (window as any).Translator;
      component.checkRequirements();
      expect(component.apiFlag.status).toBe(RequirementStatus.Fail);
      expect(component.allRequirementsStatus).toBe(RequirementStatus.Fail);
    });
  });

  describe('checkAvailability', () => {
    it('should call Translator.availability and update status', async () => {
      mockTranslator.availability.and.returnValue(Promise.resolve(AvailabilityStatusEnum.Available));
      component.sourceLanguage.setValue(LocaleEnum.EnUs);
      component.targetLanguage.setValue(LocaleEnum.FrFr);
      await component.checkAvailability();
      expect(mockTranslator.availability).toHaveBeenCalledWith({ sourceLanguage: LocaleEnum.EnUs, targetLanguage: LocaleEnum.FrFr });
      expect(component.availabilityStatus).toBe(AvailabilityStatusEnum.Available);
      expect(component.error).toBeUndefined(); // Inherited error
    });

    it('should handle Translator.availability rejection', async () => {
      const err = new Error('Availability check failed');
      mockTranslator.availability.and.returnValue(Promise.reject(err));
      await component.checkAvailability();
      expect(component.availabilityStatus).toBe(AvailabilityStatusEnum.Unavailable);
      expect(component.availabilityError).toBe(err); // Local error for availability
      expect(component.error).toBe(err); // Inherited general error
    });
  });

  describe('translate', () => {
    beforeEach(() => {
      component.content.setValue('Hello');
      component.sourceLanguage.setValue(LocaleEnum.EnUs);
      component.targetLanguage.setValue(LocaleEnum.FrFr);
      fixture.detectChanges(); 
    });

    it('should call Translator.create and instance.translate on success', async () => {
      await component.translate();

      expect(mockTranslator.create).toHaveBeenCalledWith(jasmine.objectContaining({
        sourceLanguage: LocaleEnum.EnUs,
        targetLanguage: LocaleEnum.FrFr,
        signal: component.abortControllerFromCreate.signal 
      }));
      expect(mockTranslatorInstance.translate).toHaveBeenCalledWith('Hello', { signal: component.abortController.signal });
      expect(component.status).toBe(TaskStatus.Completed); // Inherited status
      expect(component.output).toBe('Mocked translated text'); // Inherited output
      expect(component.outputCollapsed).toBe(false); // Inherited
    });
    
    it('should update "loaded" property via monitor callback during create', async () => {
      // @ts-ignore
      (window as any).Translator.create.and.callFake(async (options: any) => {
        if (options.monitor) {
          const mockMonitorTarget = new EventTarget();
          options.monitor(mockMonitorTarget);
          const progressEvent = new CustomEvent("downloadprogress", {});
           // @ts-ignore
          progressEvent.loaded = 0.85; 
          mockMonitorTarget.dispatchEvent(progressEvent);
        }
        return Promise.resolve(mockTranslatorInstance);
      });

      await component.translate();
      expect(component.loaded).toBe(0.85); // Inherited loaded
    });

    it('should handle error during Translator.create', async () => {
      const err = new Error('Create failed');
      mockTranslator.create.and.returnValue(Promise.reject(err));
      await component.translate();
      expect(component.status).toBe(TaskStatus.Error);
      expect(component.error).toBe(err);
    });

    it('should handle error during instance.translate', async () => {
      const err = new Error('Translate failed');
      mockTranslatorInstance.translate.and.returnValue(Promise.reject(err));
      await component.translate();
      expect(component.status).toBe(TaskStatus.Error);
      expect(component.error).toBe(err);
    });
  });

  describe('reset', () => {
    it('should reset steps and call checkRequirements', () => {
      spyOn(component, 'checkRequirements');
      component.steps = { step0: { status: TaskStatus.Completed } } as any; // Mutate steps
      component.reset();
      expect(component.steps.step0.status).toBe(TaskStatus.Idle);
      // Add more assertions for other steps if their structure is known/important
      expect(component.checkRequirements).toHaveBeenCalled();
    });
  });
});
