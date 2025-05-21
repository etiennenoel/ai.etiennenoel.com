import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Router, ActivatedRoute, convertToParamMap } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { DragDropModule, CdkDragDrop } from '@angular/cdk/drag-drop';
import { BehaviorSubject, of } from 'rxjs';

import { MultimodalPromptApiComponent } from './multimodal-prompt-api.component';
import { TaskStatus } from '../../enums/task-status.enum';
import { RequirementStatus } from '../../enums/requirement-status.enum';
import { AvailabilityStatusEnum } from '../../enums/availability-status.enum';
import { MediaInformationType } from '../prompt-api/media-information.type';
import { ImageInformationType } from '../prompt-api/image-information.type';
import { AudioInformationType } from '../prompt-api/audio-information.type';

// Mock the global LanguageModel object
// @ts-ignore
const mockLanguageModelInstance = {
  prompt: jasmine.createSpy('prompt').and.returnValue(Promise.resolve('Mocked LLM output')),
};
// @ts-ignore
const mockLanguageModel = {
  availability: jasmine.createSpy('availability').and.returnValue(Promise.resolve(AvailabilityStatusEnum.Available)),
  create: jasmine.createSpy('create').and.returnValue(Promise.resolve(mockLanguageModelInstance)),
};

// Mock FileSystemFileHandle
const mockFileSystemFileHandle = {
  getFile: jasmine.createSpy('getFile').and.returnValue(Promise.resolve(new File([''], 'test.png', { type: 'image/png' }))),
  name: 'test.png',
  kind: 'file'
} as unknown as FileSystemFileHandle;


describe('MultimodalPromptApiComponent', () => {
  let component: MultimodalPromptApiComponent;
  let fixture: ComponentFixture<MultimodalPromptApiComponent>;
  let mockRouter: Router;
  let mockActivatedRoute: ActivatedRoute;
  let mockTitleService: jasmine.SpyObj<Title>;
  let mockPlatformId: Object;

  const queryParamsSubject = new BehaviorSubject(convertToParamMap({}));

  beforeEach(async () => {
    mockTitleService = jasmine.createSpyObj('Title', ['setTitle']);
    mockPlatformId = 'browser';

    // @ts-ignore
    (window as any).LanguageModel = mockLanguageModel;
    // @ts-ignore
    (window as any).FileSystemFileHandle = mockFileSystemFileHandle;
     // Mock createImageBitmap
    (window as any).createImageBitmap = jasmine.createSpy('createImageBitmap').and.callFake(blob => Promise.resolve(new ImageBitmap()));
    // Mock AudioContext
    const mockAudioBuffer = { numberOfChannels: 1, duration: 10 } as AudioBuffer;
    (window as any).AudioContext = jasmine.createSpy('AudioContext').and.returnValue({
        decodeAudioData: jasmine.createSpy('decodeAudioData').and.returnValue(Promise.resolve(mockAudioBuffer))
    });


    await TestBed.configureTestingModule({
      declarations: [MultimodalPromptApiComponent],
      imports: [
        FormsModule,
        ReactiveFormsModule,
        DragDropModule,
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

    fixture = TestBed.createComponent(MultimodalPromptApiComponent);
    component = fixture.componentInstance;
    mockRouter = TestBed.inject(Router);
    spyOn(mockRouter, 'navigate');
    mockLanguageModelInstance.prompt.calls.reset();
    mockLanguageModel.availability.calls.reset();
    mockLanguageModel.create.calls.reset();
  });

  afterEach(() => {
    // @ts-ignore
    delete (window as any).LanguageModel;
    // @ts-ignore
    delete (window as any).FileSystemFileHandle;
    delete (window as any).createImageBitmap;
    delete (window as any).AudioContext;
  });

  it('should create', () => {
    fixture.detectChanges(); // ngOnInit
    expect(component).toBeTruthy();
  });

  describe('Initialization (ngOnInit)', () => {
    it('should set title and call checkRequirements', () => {
      fixture.detectChanges();
      expect(mockTitleService.setTitle).toHaveBeenCalledWith('Multimodal Prompt API (Experimental) | AI Playground');
      spyOn(component, 'checkRequirements').and.callThrough(); // Ensure it's called after explicit call
      component.ngOnInit(); // Call again to check spy
      expect(component.checkRequirements).toHaveBeenCalled();
    });
    
    it('should initialize outputCollapsed to true', () => {
      fixture.detectChanges();
      expect(component.outputCollapsed).toBe(true);
    });

    it('should subscribe to queryParams and set form controls', fakeAsync(() => {
      queryParamsSubject.next(convertToParamMap({
        prompt: 'test prompt',
        promptTypes: 'audio',
        jsonSchema: 'test schema',
        includeJSONSchema: 'true'
      }));
      fixture.detectChanges();
      tick();
      expect(component.promptFormControl.value).toBe('test prompt');
      expect(component.promptTypesFormControl.value).toBe('audio');
      expect(component.jsonSchema).toBe('test schema');
      expect(component.includeJSONSchema).toBe(true);
    }));

    it('should update queryParams on promptFormControl change', fakeAsync(() => {
      fixture.detectChanges();
      component.promptFormControl.setValue('new prompt');
      tick();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['.'], jasmine.objectContaining({ queryParams: { prompt: 'new prompt' } }));
    }));
  });

  describe('checkRequirements', () => {
    it('should set apiFlag to Pass if LanguageModel is available', () => {
      component.platformId = 'browser';
      // @ts-ignore
      (window as any).LanguageModel = {};
      component.checkRequirements();
      expect(component.apiFlag.status).toBe(RequirementStatus.Pass);
    });

    it('should set apiFlag to Fail if LanguageModel is not available', () => {
      component.platformId = 'browser';
      // @ts-ignore
      delete (window as any).LanguageModel;
      component.checkRequirements();
      expect(component.apiFlag.status).toBe(RequirementStatus.Fail);
    });
  });

  describe('checkAvailability', () => {
    it('should call LanguageModel.availability and update status', async () => {
      mockLanguageModel.availability.and.returnValue(Promise.resolve(AvailabilityStatusEnum.Available));
      await component.checkAvailability();
      expect(mockLanguageModel.availability).toHaveBeenCalledWith({});
      expect(component.availabilityStatus).toBe(AvailabilityStatusEnum.Available);
      expect(component.error).toBeUndefined(); // Inherited error
    });

    it('should handle LanguageModel.availability rejection', async () => {
      const err = new Error('Availability failed');
      mockLanguageModel.availability.and.returnValue(Promise.reject(err));
      await component.checkAvailability();
      expect(component.availabilityStatus).toBe(AvailabilityStatusEnum.Unavailable);
      expect(component.error).toBe(err); // Inherited error
    });
  });

  describe('Media Handling', () => {
    it('should add image information onFileSystemHandlesDropped for image', async () => {
        const mockImageFile = new File(['image data'], 'image.jpg', { type: 'image/jpeg' });
        const mockImageHandle = {
            kind: 'file',
            getFile: jasmine.createSpy('getFile').and.returnValue(Promise.resolve(mockImageFile)),
            name: 'image.jpg'
        } as unknown as FileSystemFileHandle;

        await component.onFileSystemHandlesDropped([mockImageHandle]);
        expect(component.medias.length).toBe(1);
        expect(component.medias[0].type).toBe('image');
        expect((component.medias[0] as ImageInformationType).title).toBe('image.jpg');
    });

    it('should add audio information onFileSystemHandlesDropped for audio', async () => {
        const mockAudioFile = new File([new ArrayBuffer(10)], 'audio.mp3', { type: 'audio/mpeg' });
        const mockAudioHandle = {
            kind: 'file',
            getFile: jasmine.createSpy('getFile').and.returnValue(Promise.resolve(mockAudioFile)),
            name: 'audio.mp3'
        } as unknown as FileSystemFileHandle;
        
        await component.onFileSystemHandlesDropped([mockAudioHandle]);
        expect(component.medias.length).toBe(1);
        expect(component.medias[0].type).toBe('audio');
        expect((component.medias[0] as AudioInformationType).title).toBe('audio.mp3');
    });
    
    it('should set error for unsupported file type onFileSystemHandlesDropped', async () => {
        const mockTextFile = new File(['text data'], 'text.txt', { type: 'text/plain' });
        const mockTextHandle = {
            kind: 'file',
            getFile: jasmine.createSpy('getFile').and.returnValue(Promise.resolve(mockTextFile)),
            name: 'text.txt'
        } as unknown as FileSystemFileHandle;

        await component.onFileSystemHandlesDropped([mockTextHandle]);
        expect(component.medias.length).toBe(0);
        expect(component.error?.message).toContain("Unsupported file type 'text/plain'");
    });


    it('should delete media', async () => {
      const mockImageFile = new File(['image data'], 'image.jpg', { type: 'image/jpeg' });
      const mockImageHandle = { kind: 'file', getFile: () => Promise.resolve(mockImageFile), name: 'image.jpg'} as FileSystemFileHandle;
      await component.onFileSystemHandlesDropped([mockImageHandle]);
      expect(component.medias.length).toBe(1);
      component.deleteMedia(0);
      expect(component.medias.length).toBe(0);
    });
  });

  describe('execute', () => {
    beforeEach(() => {
      component.promptFormControl.setValue('Test prompt');
      // @ts-ignore
      (window as any).LanguageModel = mockLanguageModel; // Ensure it's reset for these tests
      fixture.detectChanges(); // ngOnInit
    });

    it('should execute prompt and set output', async () => {
      await component.execute();
      expect(mockLanguageModel.create).toHaveBeenCalled();
      expect(mockLanguageModelInstance.prompt).toHaveBeenCalledWith(
        jasmine.arrayContaining(['Test prompt']), // Check if the prompt text is included
        undefined // No responseConstraint by default
      );
      expect(component.status).toBe(TaskStatus.Completed);
      expect(component.output).toBe('Mocked LLM output');
      expect(component.outputCollapsed).toBe(false);
    });

    it('should execute prompt with JSON schema if includeJSONSchema is true', async () => {
      component.includeJSONSchema = true;
      component.jsonSchema = '{"type": "object"}';
      await component.execute();
      expect(mockLanguageModelInstance.prompt).toHaveBeenCalledWith(
        jasmine.arrayContaining(['Test prompt']),
        { responseConstraint: { type: 'object' } }
      );
    });

    it('should handle error during LanguageModel.create', async () => {
      const err = new Error('Create failed');
      mockLanguageModel.create.and.returnValue(Promise.reject(err));
      await component.execute();
      expect(component.status).toBe(TaskStatus.Error);
      expect(component.error).toBe(err);
    });

    it('should handle error during languageModel.prompt', async () => {
      const err = new Error('Prompt failed');
      mockLanguageModelInstance.prompt.and.returnValue(Promise.reject(err));
      await component.execute();
      expect(component.status).toBe(TaskStatus.Error);
      expect(component.error).toBe(err);
    });
  });
});
