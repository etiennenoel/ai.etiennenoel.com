import {
  Component,
  EventEmitter,
  Inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  PLATFORM_ID,
  SimpleChanges
} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router"; // Removed RouterOutlet if not used
import {TaskStatus} from '../../enums/task-status.enum';
// RequirementInterface, RequirementStatus, BaseComponent removed
import {DOCUMENT} from '@angular/common'; // Removed isPlatformBrowser
import {Title} from '@angular/platform-browser';
import {MediaInformationInterface} from '../prompt-api/media-information.interface';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {FormControl} from '@angular/forms';
import {AvailabilityStatusEnum} from '../../enums/availability-status.enum';
import {BaseApiPageComponent} from '../../components/base/base-api-page.component'; // Changed import
import {AudioSampleInterface} from '../../interfaces/audio-sample.interface';
import {ImageSampleInterface} from '../../interfaces/image-sample.interface';
import {MediaInformationType} from '../prompt-api/media-information.type';
import {ImageInformationType} from '../prompt-api/image-information.type';
import {AudioInformationType} from '../prompt-api/audio-information.type';

@Component({
  selector: 'app-multimodal-prompt-api',
  templateUrl: './multimodal-prompt-api.component.html',
  standalone: false,
  styleUrl: './multimodal-prompt-api.component.scss'
})
export class MultimodalPromptApiComponent extends BaseApiPageComponent implements OnInit { // Changed heritage
  // apiName and apiFlagName for BaseApiPageComponent
  public apiName = 'LanguageModel';
  public apiFlagName = 'chrome://flags/#prompt-api-for-gemini-nano-multimodal-input';

  medias: MediaInformationType[] = [];

  // error, availabilityError removed (inherited)

  // <editor-fold desc="Prompt Types">
  private _promptTypes: "image" | "audio" | null = "image";
  public promptTypesFormControl: FormControl<"image" | "audio" | null> = new FormControl<"image" | "audio">("image");

  get promptTypes(): "image" | "audio" | null {
    return this._promptTypes;
  }

  set promptTypes(value: "image" | "audio" | null) {
    this.setPromptTypes(value);
  }

  setPromptTypes(value: "image" | "audio" | null, options?: {emitFormControlEvent?: boolean, emitChangeEvent?: boolean}) {
    this._promptTypes = value;
    this.promptTypesFormControl.setValue(value, {emitEvent: options?.emitFormControlEvent ?? true});
    if(options?.emitChangeEvent ?? true) {
      this.promptTypesChange.emit(value);
    }
    this.router.navigate(['.'], { relativeTo: this.route, queryParams: { promptTypes: value}, queryParamsHandling: 'merge' });
  }

  @Output()
  promptTypesChange = new EventEmitter<"image" | "audio" | null>();
  // </editor-fold>

  // Task Status section (_status, status getter/setter, statusChange) removed (inherited)

  // <editor-fold desc="Prompt">
  private _prompt: string | null = "Describe this.";
  public promptFormControl: FormControl<string | null> = new FormControl<string | null>("Describe this.");

  get prompt(): string | null {
    return this._prompt;
  }

  set prompt(value: string | null) {
    this.setPrompt(value);
  }

  setPrompt(value: string | null, options?: {emitFormControlEvent?: boolean, emitChangeEvent?: boolean}) {
    this._prompt = value;
    this.promptFormControl.setValue(value, {emitEvent: options?.emitFormControlEvent ?? true});
    if(options?.emitChangeEvent ?? true) {
      this.promptChange.emit(value);
    }
    this.router.navigate(['.'], { relativeTo: this.route, queryParams: { prompt: value}, queryParamsHandling: 'merge' });
  }

  @Output()
  public promptChange = new EventEmitter<string | null>();
  // </editor-fold>

  // Output section (_output, output getter/setter, outputChange, outputChunksChange) removed (inherited)
  // Download Progress section (_loaded, loaded getter/setter, loadedChange) removed (inherited)
  // outputCollapsed removed (inherited)

  // <editor-fold desc="Json Schema">
  jsonSchema: string = "";
  // </editor-fold>

  private _includeJSONSchema: boolean = false;

  get includeJSONSchema(): boolean {
    return this._includeJSONSchema;
  }

  set includeJSONSchema(value: boolean) {
    this._includeJSONSchema = value;
    this.router.navigate(['.'], { relativeTo: this.route, queryParams: { includeJSONSchema: value}, queryParamsHandling: 'merge' });
  }

  audioSamples: AudioSampleInterface[] = [
    {
      filename: "audio_clip_1_woman_english.mp3",
      title: "Audio Clip #1 (Stereo) (.mp3)",
      speaker: "woman",
      duration: "00:00:16",
      language: "English",
      format: "mp3",
      channels: "stereo",
    },
    {
      filename: "audio_clip_1_woman_english_mono.wav",
      title: "Audio Clip #1 (Mono) (.wav)",
      speaker: "woman",
      duration: "00:00:16",
      language: "English",
      format: "wav",
      channels: "mono",
    }
  ];

  imageSamples: ImageSampleInterface[] = [
    {
      filename: "palm_tree.jpg",
      title: "Palm Tree",
      format: "jpg",
    }
  ];

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

  override ngOnInit() {
    super.ngOnInit(); // Call to super.ngOnInit()

    this.setTitle("Multimodal Prompt API (Experimental) | AI Playground")

    this.subscriptions.push(this.route.queryParams.subscribe((params) => {
      if (params['prompt']) {
        this.promptFormControl.setValue(params['prompt']);
      }
      if (params['promptTypes']) {
        this.promptTypesFormControl.setValue(params['promptTypes']);
      }
      if (params['jsonSchema']) {
        this.jsonSchema = params['jsonSchema'];
      }
      if (params['includeJSONSchema']) {
        this._includeJSONSchema = params['includeJSONSchema'] === "true";
      }
    }));

    this.subscriptions.push(this.promptFormControl.valueChanges.subscribe((value) => {
      this.setPrompt(value, {emitChangeEvent: true, emitFormControlEvent: false});
    }));

    this.subscriptions.push(this.promptTypesFormControl.valueChanges.subscribe((value) => {
      this.setPromptTypes(value, {emitChangeEvent: true, emitFormControlEvent: false});
    }));

    // this.checkRequirements() // Removed, handled by BaseApiPageComponent's ngOnInit
  }

  jsonSchemaChange(jsonSchema: string) {
    this.router.navigate(['.'], { relativeTo: this.route, queryParams: { jsonSchema}, queryParamsHandling: 'merge' });
  }

  // checkRequirements() removed (handled by BaseApiPageComponent)

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

  async getImageInformation(options: Partial<{fileSystemFileHandle: FileSystemFileHandle, filename: string, title: string}>): Promise<ImageInformationType>  {
    let title: string = options.title ?? "";
    let blob: Blob;

    if(options.fileSystemFileHandle) {
      blob = await options.fileSystemFileHandle.getFile()

      if(title === "") {
        title = options.fileSystemFileHandle.name;
      }
    }
    else if(options.filename) {
      const imageFile = await fetch(`./images/${options.filename}`);
      blob = await imageFile.blob();

      if(title === "") {
        title = options.filename;
      }
    }
    else {
      throw new Error("No file provided.");
    }

    return {
      type: "image",
      includeInPrompt: true,
      title,
      fileSystemFileHandle: options.fileSystemFileHandle,
      blob,
    }
  }

  async getAudioInformation(options: Partial<{fileSystemFileHandle: FileSystemFileHandle, filename: string, title: string}>): Promise<AudioInformationType> {
    const audioContext = new AudioContext();
    let title: string = options.title ?? "";
    let arrayBuffer: ArrayBuffer;
    let type: string = "";

    if(options.fileSystemFileHandle) {
      const file = await options.fileSystemFileHandle.getFile();
      arrayBuffer = await file.arrayBuffer();

      if(title === "") {
        title = options.fileSystemFileHandle.name;
      }

      // Extract extension
      type = file.name.split('.').pop() ?? "";
    }
    else if(options.filename) {
      const audioFile = await fetch(`./audio/${options.filename}`);
      arrayBuffer = await audioFile.arrayBuffer();

      if(title === "") {
        title = options.filename;
      }

      // Extract extension
      type = options.filename.split('.').pop() ?? "";
    } else {
      throw new Error("No file provided.");
    }

    const blob = new Blob([arrayBuffer], {type: type});
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    let mimeType: string;
    switch (type) {
      case "wav":
        mimeType = "audio/wav";
        break;
      case "mp3":
        mimeType = "audio/mpeg";
        break;
      default:
        throw new Error(`Unsupported audio format: '${type}'.`);
    }

    // convert seconds to 00:00:00 format
    const duration = Math.floor(audioBuffer.duration);
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = duration % 60;
    const durationString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    return {
      type: "audio",
      title,
      audioBuffer,
      channels: audioBuffer.numberOfChannels === 1 ? "mono" : "stereo",
      duration: durationString,
      mimeType,
      includeInPrompt: true,
      fileSystemFileHandle: options.fileSystemFileHandle,
      blob,
    }
  }

  onFileSystemHandlesDropped(fileSystemHandles: FileSystemHandle[]) {
    fileSystemHandles.forEach(async (fileSystemHandle) => {
      if (fileSystemHandle.kind === "directory") {
        return;
      }

      const fileSystemFileHandle = fileSystemHandle as FileSystemFileHandle;
      const file = await fileSystemFileHandle.getFile()

      if (file.type.startsWith("image")) {
        const imageInformation = await this.getImageInformation({
          fileSystemFileHandle: fileSystemFileHandle,
        });

        this.medias.push(imageInformation);
      } else if (file.type.startsWith("audio")) {
        const audioInformation = await this.getAudioInformation({
          fileSystemFileHandle: fileSystemFileHandle,
        })

        this.medias.push(audioInformation);
      } else {
        this.error = new Error(`Unsupported file type '${file.type}' for '${file.name}'.`);
      }
    })
  }

  // availabilityStatus removed (inherited)

  // Renaming existing getters and adapting methods for abstract member implementation
  // Existing checkAvailabilityCode getter becomes the implementation for the abstract one.
  get checkAvailabilityCode(): string {
    return `LanguageModel.availability({})`;
  }

  // Existing checkAvailability method adapted for abstract member
  async checkAvailability(): Promise<void> { // Implements abstract method
    this.status = TaskStatus.InProgress; // Example for task status
    this.availabilityError = undefined;
    try {
      // @ts-expect-error LanguageModel might not be on window directly
      const availability = await window.LanguageModel.availability({});
      this.availabilityStatus = availability as AvailabilityStatusEnum; // Cast if necessary
      this.status = TaskStatus.Completed;
    } catch (e: any) {
      this.availabilityStatus = AvailabilityStatusEnum.Unavailable; // Or Unknown
      this.availabilityError = e;
      this.status = TaskStatus.Error;
    }
  }

  // Existing executeCode getter becomes the implementation for the abstract one.
  // Note: This might need access to 'options' or 'file' which are not component properties.
  // This might be better as a method or require placeholder values if it's just for display.
  // For now, assuming it's for display and promptFormControl is accessible.
  get executeCode(): string {
    return `const languageModel = await LanguageModel.create();

// Assuming 'file' and 'audioContext' are available in the execution context
// const audioContext = new AudioContext();
// const file = await options.fileSystemFileHandle.getFile();

const output = await languageModel.prompt([
  "${this.promptFormControl.value ?? ""}",
  // Example prompt structure, actual content creation will be in execute()
  // {
  //   type: "image",
  //   content: createImageBitmap(file), // Placeholder
  // },{
  //   type: "audio",
  //   content: await audioContext.decodeAudioData(await file.arrayBuffer()), // Placeholder
  // },
]);`;
  }

  async selectAudioSample(audioSample: AudioSampleInterface) {
    const audioInformation = await this.getAudioInformation({
      filename: audioSample.filename,
      title: audioSample.title,
    })

    this.medias.push(audioInformation);
  }

  async selectImageSample(imageSample: ImageSampleInterface) {
    const imageInformation = await this.getImageInformation({
      filename: imageSample.filename,
      title: imageSample.title,
    });

    this.medias.push(imageInformation);
  }

  async getMedia(media: MediaInformationInterface): Promise<HTMLImageElement | HTMLAudioElement | ImageBitmap | AudioBuffer> {
    switch (media.type) {
      case 'image':
        return createImageBitmap(media.blob);

      case 'audio':
        const audioInformation = media as AudioInformationType;
        if(!audioInformation.audioBuffer) {
          throw new Error("Audio buffer invalid.");
        }
        return audioInformation.audioBuffer;
    }
  }

  getDuration(media: MediaInformationInterface) {
    if(media.type !== "audio") {
      throw new Error(`Invalid media, cannot get duration for type: '${media.type}'.`);
    }

    return (media as AudioInformationType).duration;
  }

  getChannels(media: MediaInformationInterface) {
    if(media.type !== "audio") {
      throw new Error(`Invalid media, cannot get channels for type: '${media.type}'.`);
    }

    switch((media as AudioInformationType).channels) {
      case "mono":
        return "Mono";
      case "stereo":
        return "Stereo";
      default:
        return (media as AudioInformationType).channels;
    }
  }

  async prompts(): Promise<any[]> {
    const prompts: any[] = await Promise.all(this.medias.filter(media => media.includeInPrompt).map(async (media) => {
      return {
        type: media.type,
        content: await this.getMedia(media),
      }
    }));

    prompts.unshift(this.promptFormControl.value)

    return prompts;
  }

  // Existing execute method adapted for abstract member
  async execute(): Promise<void> { // Implements abstract method
    this.status = TaskStatus.Executing; // Use inherited status
    this.outputCollapsed = false; // Use inherited outputCollapsed
    this.output = ""; // Use inherited output
    this.loaded = 0; // Use inherited loaded
    this.error = undefined; // Use inherited error

    try {
      // @ts-expect-error LanguageModel might not be on window directly
      const languageModel = await window.LanguageModel.create({
        // expectedInputs might need to be dynamic based on this.medias
        expectedInputs: [
          { type: "audio" },
          { type: "image" }
        ]
      });

      const promptsArray: any[] = await this.prompts(); // Call existing prompts() method

      if(this.includeJSONSchema && this.jsonSchema) {
        const jsonSchemaCleaned = this.jsonSchema.replace(/\\n/g, "\n").replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/\\\\/g, '\\');
        this.output = await languageModel.prompt(promptsArray, {responseConstraint: JSON.parse(jsonSchemaCleaned)});
      } else {
        this.output = await languageModel.prompt(promptsArray);
      }

      this.status = TaskStatus.Completed; // Use inherited status
    } catch (e: any) {
      this.status = TaskStatus.Error; // Use inherited status
      this.error = e; // Use inherited error
    }
  }

  protected readonly AvailabilityStatusEnum = AvailabilityStatusEnum;
}
