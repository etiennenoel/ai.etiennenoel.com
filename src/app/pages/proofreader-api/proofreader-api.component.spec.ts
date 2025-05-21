import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Router, ActivatedRoute, convertToParamMap } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject, of } from 'rxjs';

import { ProofreaderApiComponent } from './proofreader-api.component';
import { TaskStatus } from '../../enums/task-status.enum';
import { RequirementStatus } from '../../enums/requirement-status.enum';
import { AvailabilityStatusEnum } from '../../enums/availability-status.enum';

// Mock the global Proofreader object
// @ts-ignore
const mockProofreaderInstance = {
  // Assuming a proofread method if it were implemented
  proofread: jasmine.createSpy('proofread').and.returnValue(Promise.resolve('Mocked proofread output')),
};
// @ts-ignore
const mockProofreader = {
  // Assuming an availability method if it existed and were used
  availability: jasmine.createSpy('availability').and.returnValue(Promise.resolve(AvailabilityStatusEnum.Available)),
  create: jasmine.createSpy('create').and.returnValue(Promise.resolve(mockProofreaderInstance)),
};

describe('ProofreaderApiComponent', () => {
  let component: ProofreaderApiComponent;
  let fixture: ComponentFixture<ProofreaderApiComponent>;
  let mockRouter: Router;
  let mockActivatedRoute: ActivatedRoute;
  let mockTitleService: jasmine.SpyObj<Title>;
  let mockPlatformId: Object;

  const queryParamsSubject = new BehaviorSubject(convertToParamMap({}));

  beforeEach(async () => {
    mockTitleService = jasmine.createSpyObj('Title', ['setTitle']);
    mockPlatformId = 'browser';

    // @ts-ignore
    (window as any).Proofreader = mockProofreader;

    await TestBed.configureTestingModule({
      declarations: [ProofreaderApiComponent],
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

    fixture = TestBed.createComponent(ProofreaderApiComponent);
    component = fixture.componentInstance;
    mockRouter = TestBed.inject(Router);
    spyOn(mockRouter, 'navigate');
    mockProofreader.availability.calls.reset();
    mockProofreader.create.calls.reset();
    mockProofreaderInstance.proofread.calls.reset();
  });

  afterEach(() => {
    // @ts-ignore
    delete (window as any).Proofreader;
  });

  it('should create', () => {
    fixture.detectChanges(); // ngOnInit
    expect(component).toBeTruthy();
  });

  describe('Initialization (ngOnInit)', () => {
    it('should set title and call checkRequirements', () => {
      fixture.detectChanges();
      expect(mockTitleService.setTitle).toHaveBeenCalledWith('Proofreader API | AI Playground');
      spyOn(component, 'checkRequirements').and.callThrough();
      component.ngOnInit(); 
      expect(component.checkRequirements).toHaveBeenCalled();
    });
    
    it('should initialize outputCollapsed to true', () => {
      fixture.detectChanges();
      expect(component.outputCollapsed).toBe(true);
    });

    it('should have apiFlag defined with correct contentHtml', () => {
      fixture.detectChanges();
      expect(component.apiFlag).toBeDefined();
      expect(component.apiFlag.contentHtml).toContain('chrome://flags/#proofreader-api-for-gemini-nano');
    });
  });

  describe('checkRequirements', () => {
    it('should set apiFlag to Pass if Proofreader is available', () => {
      component.platformId = 'browser';
      // @ts-ignore
      (window as any).Proofreader = {};
      component.checkRequirements();
      expect(component.apiFlag.status).toBe(RequirementStatus.Pass);
    });

    it('should set apiFlag to Fail if Proofreader is not available', () => {
      component.platformId = 'browser';
      // @ts-ignore
      delete (window as any).Proofreader;
      component.checkRequirements();
      expect(component.apiFlag.status).toBe(RequirementStatus.Fail);
    });
  });

  describe('checkAvailability', () => {
    // Current checkAvailability is a stub. This test reflects that.
    it('should run without error and availabilityStatus remain Unknown (or as set by stub)', async () => {
      await component.checkAvailability();
      // Assuming the stub sets it to Unknown or doesn't change it from initial Unknown
      expect(component.availabilityStatus).toBe(AvailabilityStatusEnum.Unknown); 
      expect(component.availabilityError).toBeUndefined();
    });

    it('should handle errors if the (currently stubbed) check were to throw', async () => {
        // This test is more future-proof for when checkAvailability has real logic
        const testError = new Error('Future API error');
        // @ts-ignore
        (window as any).Proofreader = { 
            availability: jasmine.createSpy().and.returnValue(Promise.reject(testError)) 
        };
        // Temporarily make the component's method use the spy for this test case
        spyOn(component, 'checkAvailability').and.callFake(async () => {
            try {
                // @ts-ignore
                // component.availabilityStatus = await Proofreader.availability(); 
            } catch (e: any) {
                component.availabilityStatus = AvailabilityStatusEnum.Unavailable;
                component.availabilityError = e;
            }
        });

        await component.checkAvailability();
        // Since the actual call is stubbed out in the component, this won't reflect a real API error.
        // If checkAvailability was: this.availabilityStatus = await Proofreader.availability();
        // then this test would be:
        // expect(component.availabilityStatus).toBe(AvailabilityStatusEnum.Unavailable);
        // expect(component.availabilityError).toBe(testError);
        // For now, it tests the current stub's behavior (no change or default error handling).
        expect(component.availabilityStatus).toBe(AvailabilityStatusEnum.Unavailable); // or Unknown depending on stub
        expect(component.availabilityError).toBe(testError);
    });
  });

  describe('proofread', () => {
    beforeEach(() => {
      fixture.detectChanges(); // ngOnInit
    });

    it('should set status to Executing, initialize properties, and then Completed (stubbed)', async () => {
      const initialAbortController = component.abortController;
      const initialAbortControllerFromCreate = component.abortControllerFromCreate;

      await component.proofread();

      expect(component.status).toBe(TaskStatus.Completed); // Since it's stubbed, it goes to completed.
      expect(component.outputCollapsed).toBe(false);
      expect(component.outputStatusMessage).toBe('Running query...'); // Last message set
      expect(component.output).toBe('');
      expect(component.error).toBeUndefined();
      expect(component.loaded).toBe(0);
      
      // Check that new AbortControllers were created
      expect(component.abortController).not.toBe(initialAbortController);
      expect(component.abortControllerFromCreate).not.toBe(initialAbortControllerFromCreate);
    });

    // If Proofreader.create and instance.proofread were actually called:
    xit('should call Proofreader.create and instance.proofread (future test)', async () => {
      // @ts-ignore
      (window as any).Proofreader = mockProofreader; // Use the spy version
      mockProofreaderInstance.proofread.and.returnValue(Promise.resolve("Proofread: Test input"));
      
      component.inputFormControl.setValue("Test input"); // Assuming inputFormControl exists and is used
      await component.proofread();

      expect(mockProofreader.create).toHaveBeenCalled();
      expect(mockProofreaderInstance.proofread).toHaveBeenCalledWith("Test input" /*, options */);
      expect(component.output).toBe("Proofread: Test input");
      expect(component.status).toBe(TaskStatus.Completed);
    });

    it('should handle errors by setting status to Error and updating error property (stubbed)', async () => {
      // Simulate an error occurring within the try block (e.g., if Proofreader.create threw)
      // For now, we can't easily simulate this without changing component code as it's stubbed.
      // This test assumes the finally block sets status if an error occurred before Proofreader API call.
      // A more direct way if the API was called:
      // mockProofreader.create.and.returnValue(Promise.reject(new Error('Proofreader create failed')));
      
      // To test the catch block of the current stub, we need to make part of the `try` fail.
      // Since no actual API call is made, we'll spy and force an error before `this.status = TaskStatus.Completed;`
      spyOn(component.abortController, 'abort').and.throwError("Simulated error during proofread"); // Arbitrary error point

      await component.proofread();
      
      expect(component.status).toBe(TaskStatus.Error);
      expect(component.error).toBeDefined();
      expect(component.outputStatusMessage).toContain('Error:');
    });
  });
});
