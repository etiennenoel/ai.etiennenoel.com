import { TestBed, ComponentFixture } from '@angular/core/testing';
import { PLATFORM_ID, Injectable, Component, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Subject } from 'rxjs';

import { BasePageComponent } from './base-page.component';
import { TaskStatus } from '../../enums/task-status.enum';
import { RequirementInterface } from '../../interfaces/requirement.interface';
import { RequirementStatus } from '../../enums/requirement-status.enum';

// Create a concrete component for testing the abstract BasePageComponent
@Component({
  template: ''
})
class TestHostComponent extends BasePageComponent {
  // Implement abstract methods for testing purposes
  checkRequirements(): void {
    // Mock implementation
  }

  checkAvailability(): void {
    // Mock implementation
  }

  // Expose protected properties for easier testing if needed, or use spies
  getDestroy$() {
    return this.destroy$;
  }
}

describe('BasePageComponent', () => {
  let component: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any; // Can be a simple object or more complex mock
  let mockTitleService: jasmine.SpyObj<Title>;
  let mockDocument: Document;

  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockActivatedRoute = {
      queryParams: new Subject<any>(), // Mock queryParams observable
      snapshot: {} // Mock snapshot if needed by any consuming code
    };
    mockTitleService = jasmine.createSpyObj('Title', ['setTitle']);

    await TestBed.configureTestingModule({
      declarations: [TestHostComponent],
      providers: [
        { provide: PLATFORM_ID, useValue: 'browser' }, // or 'server'
        { provide: DOCUMENT, useValue: document }, // Use global document or a mock
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: Title, useValue: mockTitleService },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    mockDocument = TestBed.inject(DOCUMENT);
    fixture.detectChanges(); // Trigger initial data binding and ngOnInit if applicable
  });

  it('should create an instance', () => {
    expect(component).toBeTruthy();
  });

  describe('Property Initialization', () => {
    it('should initialize outputCollapsed to false', () => {
      expect(component.outputCollapsed).toBe(false);
    });

    it('should initialize output to an empty string', () => {
      expect(component.output).toBe('');
    });

    it('should initialize status to TaskStatus.Initial', () => {
      expect(component.status).toBe(TaskStatus.Initial);
    });

    it('should initialize loaded to 0', () => {
      expect(component.loaded).toBe(0);
    });

    it('should initialize abortController', () => {
      expect(component.abortController).toBeDefined();
      expect(component.abortController.signal).toBeDefined();
    });

    it('should initialize abortControllerFromCreate', () => {
      expect(component.abortControllerFromCreate).toBeDefined();
      expect(component.abortControllerFromCreate.signal).toBeDefined();
    });

    it('should initialize apiFlag but expect it to be overridden or properly set by child', () => {
      // BasePageComponent initializes apiFlag, but it's often overridden.
      // Here we just check it's defined. Specifics would be in child component tests.
      expect(component.apiFlag).toBeDefined();
    });
  });

  describe('ngOnInit', () => {
    it('should call ngOnInit without errors', () => {
      spyOn(component, 'ngOnInit').and.callThrough();
      component.ngOnInit();
      expect(component.ngOnInit).toHaveBeenCalled();
    });
  });

  describe('ngOnDestroy', () => {
    it('should complete the destroy$ subject and abort controllers', () => {
      const destroySubject = component.getDestroy$();
      spyOn(destroySubject, 'next').and.callThrough();
      spyOn(destroySubject, 'complete').and.callThrough();
      spyOn(component.abortController, 'abort').and.callThrough();
      spyOn(component.abortControllerFromCreate, 'abort').and.callThrough();

      component.ngOnDestroy();

      expect(destroySubject.next).toHaveBeenCalled();
      expect(destroySubject.complete).toHaveBeenCalled();
      expect(component.abortController.abort).toHaveBeenCalled();
      expect(component.abortControllerFromCreate.abort).toHaveBeenCalled();
    });
  });

  describe('abortTriggered', () => {
    it('should abort abortController and set status to Aborted', () => {
      spyOn(component.abortController, 'abort').and.callThrough();
      component.abortTriggered();
      expect(component.abortController.abort).toHaveBeenCalled();
      expect(component.status).toBe(TaskStatus.Aborted);
    });
  });

  describe('abortFromCreateTriggered', () => {
    it('should abort abortControllerFromCreate', () => {
      spyOn(component.abortControllerFromCreate, 'abort').and.callThrough();
      component.abortFromCreateTriggered();
      expect(component.abortControllerFromCreate.abort).toHaveBeenCalled();
      // Note: abortFromCreateTriggered in the base class does not change the status.
      // If it should, the test or the component needs adjustment.
      expect(component.status).toBe(TaskStatus.Initial); // Assuming it wasn't changed
    });
  });
  
  describe('Abstract Methods', () => {
    it('should have checkRequirements defined (to be implemented by subclasses)', () => {
      expect(typeof component.checkRequirements).toBe('function');
    });

    it('should have checkAvailability defined (to be implemented by subclasses)', () => {
      expect(typeof component.checkAvailability).toBe('function');
    });
  });

});
