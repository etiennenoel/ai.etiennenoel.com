import {Component, EventEmitter, Inject, Input, OnInit, Output, PLATFORM_ID} from '@angular/core';
import {MediaInformationInterface} from './media-information.interface';
import {AvailabilityStatusEnum} from '../../enums/availability-status.enum';
// BaseComponent, RequirementStatusInterface, RequirementStatus removed
import {DOCUMENT} from '@angular/common'; // isPlatformBrowser removed
import {FormControl} from '@angular/forms';
import {LocaleEnum} from '../../enums/locale.enum';
import {ActivatedRoute, Router} from '@angular/router';
import {PromptInitialRoleEnum} from '../../enums/prompt-initial-role.enum';
import {AILanguageModelParamsInterface} from '../../interfaces/ai-language-model-params.interface';
import {TaskStatus} from '../../enums/task-status.enum';
import {PromptTypeEnum} from '../../enums/prompt-type.enum';
import {PromptRoleEnum} from '../../enums/prompt-role.enum';
import {PromptInterface} from '../../components/prompt/prompt.interface';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {Title} from '@angular/platform-browser';
// RequirementInterface removed
import {BaseApiPageComponent} from '../../components/base/base-api-page.component'; // Changed import


@Component({
  selector: 'app-content-api',
  templateUrl: './prompt-api.component.html',
  standalone: false,
  styleUrl: './prompt-api.component.scss'
})
export class PromptApiComponent extends BaseApiPageComponent implements OnInit { // Changed heritage
  // apiName and apiFlagName for BaseApiPageComponent
  public apiName = 'LanguageModel';
  public apiFlagName = 'chrome://flags/#prompt-api-for-gemini-nano';

  medias: MediaInformationInterface[] = [];

  // error removed (inherited)
  // outputCollapsed removed (inherited)
  // outputChunks removed (inherited)
  // output removed (inherited)
  // status removed (inherited)

  // <editor-fold desc="TopK">
  private _topK: number | null = 3;
  public topKFormControl: FormControl<number | null> = new FormControl<number | null>(3);

  get topK(): number | null {
    return this._topK;
  }

  @Input()
  set topK(value: number | null) {
    this.setTopK(value);
  }

  setTopK(value: number | null, options?: { emitFormControlEvent?: boolean, emitChangeEvent?: boolean }) {
    this._topK = value;
    this.topKFormControl.setValue(value, {emitEvent: options?.emitFormControlEvent ?? true});
    if (options?.emitChangeEvent ?? true) {
      this.topKChange.emit(value);
    }
  }

  @Output()
  topKChange = new EventEmitter<number | null>();
  // </editor-fold>

  // <editor-fold desc="Temperature">
  private _temperature: number | null = 1;
  public temperatureFormControl: FormControl<number | null> = new FormControl<number | null>(1);

  get temperature(): number | null {
    return this._temperature;
  }

  @Input()
  set temperature(value: number | null) {
    this.setTemperature(value);
  }

  setTemperature(value: number | null, options?: { emitFormControlEvent?: boolean, emitChangeEvent?: boolean }) {
    this._temperature = value;
    this.temperatureFormControl.setValue(value, {emitEvent: options?.emitFormControlEvent ?? true});
    if (options?.emitChangeEvent ?? true) {
      this.temperatureChange.emit(value);
    }
  }

  @Output()
  temperatureChange = new EventEmitter<number | null>();
  // </editor-fold>

  // <editor-fold desc="Expected Input Languages">
  private _expectedInputLanguages: LocaleEnum[] | null = [];
  public expectedInputLanguagesFormControl: FormControl<LocaleEnum[] | null> = new FormControl<LocaleEnum[] | null>([]);

  get expectedInputLanguages(): LocaleEnum[] | null {
    return this._expectedInputLanguages;
  }

  @Input()
  set expectedInputLanguages(value: LocaleEnum[] | null) {
    this.setExpectedInputLanguages(value);
  }

  setExpectedInputLanguages(value: LocaleEnum[] | null, options?: {
    emitFormControlEvent?: boolean,
    emitChangeEvent?: boolean
  }) {
    this._expectedInputLanguages = value;
    this.expectedInputLanguagesFormControl.setValue(value, {emitEvent: options?.emitFormControlEvent ?? true});
    if (options?.emitChangeEvent ?? true) {
      this.expectedInputLanguagesChange.emit(value);
    }
  }

  @Output()
  expectedInputLanguagesChange = new EventEmitter<LocaleEnum[] | null>();

  // </editor-fold>

  // <editor-fold desc="Prompt Type">
  private _promptType: PromptTypeEnum | null = PromptTypeEnum.String;
  public promptTypeFormControl: FormControl<PromptTypeEnum | null> = new FormControl<PromptTypeEnum | null>(PromptTypeEnum.String);

  get promptType(): PromptTypeEnum | null {
    return this._promptType;
  }

  @Input()
  set promptType(value: PromptTypeEnum | null) {
    this.setPromptType(value);
  }

  setPromptType(value: PromptTypeEnum | null, options?: {
    emitFormControlEvent?: boolean,
    emitChangeEvent?: boolean
  }) {
    this._promptType = value;
    this.promptTypeFormControl.setValue(value, {emitEvent: options?.emitFormControlEvent ?? true});
    if (options?.emitChangeEvent ?? true) {
      this.promptTypeChange.emit(value);
    }
  }

  @Output()
  promptTypeChange = new EventEmitter<PromptTypeEnum | null>();
  // </editor-fold>

  // <editor-fold desc="Use Streaming">
  private _useStreaming: boolean | null = true;
  public useStreamingFormControl = new FormControl<boolean>(true);
  @Output()
  useStreamingChange = new EventEmitter<boolean | null>();

  get useStreaming(): boolean | null {
    return this._useStreaming;
  }

  @Input()
  set useStreaming(value: boolean | null) {
    this.setUseStreaming(value);
  }

  setUseStreaming(value: boolean | null, options?: { emitChangeEvent: boolean, emitFormControlEvent: boolean }) {
    this._useStreaming = value;
    this.useStreamingFormControl.setValue(value, {emitEvent: options?.emitFormControlEvent ?? true});
    if (options?.emitChangeEvent ?? true) {
      this.useStreamingChange.emit(value);
    }
    this.router.navigate(['.'], {
      relativeTo: this.route,
      queryParams: {useStreaming: value},
      queryParamsHandling: 'merge'
    });
  }

  // </editor-fold>

  // Download Progress section (_loaded, loaded getter/setter, loadedChange) removed (inherited)

  initialPrompts: PromptInterface<PromptInitialRoleEnum>[] = [];

  prompts: PromptInterface<PromptRoleEnum>[] = [];

  prompt?: PromptInterface<PromptRoleEnum> = {
    content: "",
    role: PromptRoleEnum.User,
  };

  stringPromptFormControl = new FormControl("")

  params: AILanguageModelParamsInterface | null = null;

  constructor(
    @Inject(DOCUMENT) document: Document, // platformId removed from here
    @Inject(PLATFORM_ID) platformId: Object, // Added platformId for super
    router: Router, // No longer private readonly
    route: ActivatedRoute, // No longer private readonly
    titleService: Title, // Renamed from title
  ) {
    super(document, platformId, titleService, router, route); // Updated super call
  }

  // apiFlag removed (inherited)
  // checkRequirements removed (handled by BaseApiPageComponent)
  // availabilityStatus removed (inherited)

  // Retaining existing checkAvailabilityCode getter for abstract member
  get checkAvailabilityCode(): string {
    return `const status = await LanguageModel.availability({
  topK: ${this.topKFormControl.value},
  temperature: ${this.temperatureFormControl.value},
  expectedInputLanguages: ${JSON.stringify(this.expectedInputLanguagesFormControl.value)},
})`;
  }

  // Adapting existing checkAvailability method for abstract member
  async checkAvailability(): Promise<void> {
    this.status = TaskStatus.InProgress; // Use inherited status
    this.availabilityError = undefined; // Use inherited availabilityError
    try {
      // @ts-expect-error LanguageModel might not be on window directly
      const availability = await window.LanguageModel.availability({
        topK: this.topKFormControl.value,
        temperature: this.temperatureFormControl.value,
        expectedInputLanguages: this.expectedInputLanguagesFormControl.value,
      });
      this.availabilityStatus = availability as AvailabilityStatusEnum; // Use inherited
      this.status = TaskStatus.Completed;
    } catch (e: any) {
      this.availabilityStatus = AvailabilityStatusEnum.Unavailable; // Use inherited
      this.availabilityError = e; // Use inherited
      this.status = TaskStatus.Error;
    }
  }

  get paramsCode(): string {
    return `const params = LanguageModel.params()`;
  }

  async getParams() {
    try {
      // @ts-expect-error
      this.params = await LanguageModel.params();
    } catch (e: any) {
      this.error = e;
    }
  }

  get executeCode(): string {
    let code = `const abortController = new AbortController();

const session = await LanguageModel.create({
  topK: ${this.topKFormControl.value},
  temperature: ${this.temperatureFormControl.value},
  expectedInputLanguages: ${JSON.stringify(this.expectedInputLanguagesFormControl.value)},
  initialPrompts: ${JSON.stringify(this.initialPrompts, null, 2)},
  monitor(m: any)  {
    m.addEventListener("downloadprogress", (e: any) => {
      console.log(\`Downloaded \${e.loaded * 100}%\`);
    });
  },
  signal: abortController.signal,
});

`;

    const promptString = this.useStreamingFormControl.value ? "promptStreaming" : "prompt";

    switch (this.promptTypeFormControl.value) {
      case PromptTypeEnum.SequenceAILanguageModelPrompt:
        code += `session.${promptString}(${JSON.stringify(this.prompts, null, 2)}, {
  signal: abortController.signal,
});`;
        break;
      case PromptTypeEnum.String:
        code += `session.${promptString}("${this.stringPromptFormControl.value}", {
  signal: abortController.signal,
});`;
        break;
      case PromptTypeEnum.AILanguageModelPrompt:
        code += `session.${promptString}(${JSON.stringify(this.prompt, null, 2)}, {
  signal: abortController.signal,
});`;
        break;
    }
    return code;
  }

  async execute(): Promise<void> { // Implements abstract method
    const self = this;
    this.status = TaskStatus.Executing; // Use inherited status
    // const abortController = new AbortController(); // Use this.abortController from base class
    this.error = undefined; // Use inherited error
    this.loaded = 0; // Use inherited loaded
    this.outputCollapsed = false; // Use inherited outputCollapsed
    this.output = ""; // Use inherited output
    this.outputChunks = []; // Use inherited outputChunks

    try {
      // @ts-expect-error LanguageModel might not be on window directly
      const session = await window.LanguageModel.create({
        topK: this.topKFormControl.value,
        temperature: this.temperatureFormControl.value,
        expectedInputLanguages: this.expectedInputLanguagesFormControl.value,
        initialPrompts: this.initialPrompts,
        monitor(m: any) {
          m.addEventListener("downloadprogress", (e: any) => {
            console.log(`Downloaded ${e.loaded * 100}%`);
            self.loaded = e.loaded; // Use inherited loaded
          });
        },
        signal: this.abortController?.signal, // Use inherited abortController
      });

      if (this.useStreamingFormControl.value) {
        let prompt;

        switch (this.promptTypeFormControl.value) {
          case PromptTypeEnum.SequenceAILanguageModelPrompt:
            prompt = this.prompts;

            break;
          case PromptTypeEnum.String:
            prompt = this.stringPromptFormControl.value
            break;
          case PromptTypeEnum.AILanguageModelPrompt:
            prompt = this.prompt;
            break;
        }

        const stream: ReadableStream = session.promptStreaming(prompt, {
          signal: this.abortController?.signal, // Use inherited abortController
        });

        for await (const chunk of stream) {
          // Do something with each 'chunk'
          this.output += chunk; // Use inherited output
          this.outputChunks.push(chunk); // Use inherited outputChunks
        }
      } else {
        switch (this.promptTypeFormControl.value) {
          case PromptTypeEnum.SequenceAILanguageModelPrompt:
            this.output = await session.prompt(this.prompts, { // Use inherited output
              signal: this.abortController?.signal, // Use inherited abortController
            });

            break;
          case PromptTypeEnum.String:
            this.output = await session.prompt(this.stringPromptFormControl.value, { // Use inherited output
              signal: this.abortController?.signal, // Use inherited abortController
            });
            break;
          case PromptTypeEnum.AILanguageModelPrompt:
            this.output = await session.prompt(this.prompt, { // Use inherited output
              signal: this.abortController?.signal, // Use inherited abortController
            });
            break;
        }
      }

      this.status = TaskStatus.Completed; // Use inherited status
    } catch (e: any) {
      this.error = e; // Use inherited error
      this.status = TaskStatus.Error; // Use inherited status
    }
  }

  override ngOnInit() {
    super.ngOnInit(); // Call to super.ngOnInit()

    this.setTitle("Prompt API | AI Playground");

    // this.checkRequirements() // Removed, handled by BaseApiPageComponent's ngOnInit

    this.subscriptions.push(this.topKFormControl.valueChanges.subscribe((value) => {
      this.setTopK(value, {emitChangeEvent: true, emitFormControlEvent: false});
      this.router.navigate(['.'], {
        relativeTo: this.route,
        queryParams: {topK: this.topK},
        queryParamsHandling: 'merge'
      });
    }));
    this.subscriptions.push(this.temperatureFormControl.valueChanges.subscribe((value) => {
      this.setTemperature(value, {emitChangeEvent: true, emitFormControlEvent: false});
      this.router.navigate(['.'], {
        relativeTo: this.route,
        queryParams: {temperature: this.temperature},
        queryParamsHandling: 'merge'
      });
    }));
    this.subscriptions.push(this.expectedInputLanguagesFormControl.valueChanges.subscribe((value) => {
      this.setExpectedInputLanguages(value, {emitChangeEvent: true, emitFormControlEvent: false});
      this.router.navigate(['.'], {
        relativeTo: this.route,
        queryParams: {expectedInputLanguages: this.expectedInputLanguages},
        queryParamsHandling: 'merge'
      });
    }));
    this.subscriptions.push(this.promptTypeFormControl.valueChanges.subscribe((value) => {
      this.setPromptType(value, {emitChangeEvent: true, emitFormControlEvent: false});
      this.router.navigate(['.'], {
        relativeTo: this.route,
        queryParams: {promptType: this.promptType},
        queryParamsHandling: 'merge'
      });
    }));
    this.subscriptions.push(this.stringPromptFormControl.valueChanges.subscribe((value) => {
      this.router.navigate(['.'], {
        relativeTo: this.route,
        queryParams: {stringPrompt: value},
        queryParamsHandling: 'merge'
      });
    }));

    this.subscriptions.push(this.route.queryParams.subscribe((params) => {
      if (params['topK']) {
        this.setTopK(params['topK'], {emitChangeEvent: false, emitFormControlEvent: false});
      }

      if (params['temperature']) {
        this.setTemperature(params['temperature'], {emitChangeEvent: false, emitFormControlEvent: false});
      }

      if (params['promptType']) {
        this.setPromptType(params['promptType'], {emitChangeEvent: false, emitFormControlEvent: false});
      }

      if (params['initialPrompts']) {
        this.initialPrompts = JSON.parse(params['initialPrompts']);
      }

      if (params['prompts']) {
        this.prompts = JSON.parse(params['prompts']);
      }

      if (params['prompt']) {
        this.prompt = JSON.parse(params['prompt']);
      }

      if (params['stringPrompt']) {
        this.stringPromptFormControl.setValue(params['stringPrompt']);
      }

      if (params['expectedInputLanguages']) {
        if (!Array.isArray(params['expectedInputLanguages'])) {
          this.setExpectedInputLanguages([params['expectedInputLanguages']], {
            emitChangeEvent: false,
            emitFormControlEvent: false
          });
        } else {
          this.setExpectedInputLanguages(params['expectedInputLanguages'], {
            emitChangeEvent: false,
            emitFormControlEvent: false
          });
        }
      }
    }));
  }

  appendInitialPrompt() {
    this.initialPrompts.push({
      content: "",
      role: PromptInitialRoleEnum.User,
    })
  }

  onInitialPromptsChange(value: PromptInterface<PromptInitialRoleEnum>, index: number) {
    this.initialPrompts[index] = value;

    this.router.navigate(['.'], {
      relativeTo: this.route,
      queryParams: {initialPrompts: JSON.stringify(this.initialPrompts)},
      queryParamsHandling: 'merge'
    })
  }

  deleteInitialPrompt(index: number) {
    this.initialPrompts.splice(index, 1);
    this.router.navigate(['.'], {
      relativeTo: this.route,
      queryParams: {initialPrompts: JSON.stringify(this.initialPrompts)},
      queryParamsHandling: 'merge'
    })
  }

  appendPrompt() {
    this.prompts.push({
      content: "",
      role: PromptRoleEnum.User,
    })
  }

  onPromptsChange(value: PromptInterface<PromptRoleEnum>, index: number) {
    this.prompts[index] = value;

    this.router.navigate(['.'], {
      relativeTo: this.route,
      queryParams: {prompts: JSON.stringify(this.prompts)},
      queryParamsHandling: 'merge'
    })
  }

  deletePrompt(index: number) {
    this.prompts.splice(index, 1);
    this.router.navigate(['.'], {
      relativeTo: this.route,
      queryParams: {prompts: JSON.stringify(this.prompts)},
      queryParamsHandling: 'merge'
    })
  }

  onPromptChange(value: PromptInterface<PromptRoleEnum>) {
    this.prompt = value;

    this.router.navigate(['.'], {
      relativeTo: this.route,
      queryParams: {prompt: JSON.stringify(this.prompt)},
      queryParamsHandling: 'merge'
    })
  }

  drop(event: CdkDragDrop<any[]>) {
    // Update your data based on the drop event
    moveItemInArray(this.medias, event.previousIndex, event.currentIndex);
  }

  deleteMedia(index: number) {
    this.medias.splice(index, 1);
  }

  getImageSrc(media: MediaInformationInterface) {
    return URL.createObjectURL(media.blob);
  }

  getAudioSrc(media: MediaInformationInterface) {
    return URL.createObjectURL(media.blob);
  }

  onFileSystemHandlesDropped(fileSystemHandles: FileSystemHandle[]) {
    fileSystemHandles.forEach(async (fileSystemHandle) => {
      if (fileSystemHandle.kind === "directory") {
        return;
      }

      const fileSystemFileHandle = fileSystemHandle as FileSystemFileHandle;
      const file = await fileSystemFileHandle.getFile()

      if (file.type.startsWith("image")) {
        this.medias.push({
          type: 'image',
          blob: file,
          title: file.name,
          includeInPrompt: true,
          fileSystemFileHandle,
        });
      } else if (file.type.startsWith("audio")) {
        this.medias.push({
          type: 'audio',
          blob: file,
          title: file.name,
          includeInPrompt: true,
          fileSystemFileHandle,
        });
      } else {
        this.error = new Error(`Unsupported file type '${file.type}' for '${file.name}'.`);
      }
    })
  }

  protected readonly AvailabilityStatusEnum = AvailabilityStatusEnum;
  protected readonly RequirementStatus = RequirementStatus;
  protected readonly LocaleEnum = LocaleEnum;
  protected readonly PromptInitialRoleEnum = PromptInitialRoleEnum;
  protected readonly PromptTypeEnum = PromptTypeEnum;
  protected readonly PromptRoleEnum = PromptRoleEnum;
}
