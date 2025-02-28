import {Component, EventEmitter, Inject, Input, OnInit, Output, PLATFORM_ID} from '@angular/core';
import {ActivatedRoute, Router, RouterOutlet} from "@angular/router";
import {TaskStatus} from '../../enums/task-status.enum';
import {RequirementInterface} from '../../interfaces/requirement.interface';
import {DOCUMENT, isPlatformBrowser} from '@angular/common';
import {Title} from '@angular/platform-browser';
import {BaseComponent} from '../../components/base/base.component';
import {RequirementStatus} from '../../enums/requirement-status.enum';
import {MediaInformationInterface} from '../prompt-api/media-information.interface';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {FormControl} from '@angular/forms';
import {AvailabilityStatusEnum} from '../../enums/availability-status.enum';
import {BasePageComponent} from '../../components/base/base-page.component';
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
export class MultimodalPromptApiComponent extends BasePageComponent implements OnInit {
  medias: MediaInformationType[] = [];

  media?: MediaInformationType;

  error?: Error;

  public availabilityError?: Error;

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

  // <editor-fold desc="Task Status">
  private _status: TaskStatus = TaskStatus.Idle;

  get status(): TaskStatus {
    return this._status;
  }

  set status(value: TaskStatus) {
    this._status = value;
    this.statusChange.emit(value);
  }

  @Output()
  public statusChange = new EventEmitter<TaskStatus>();
  // </editor-fold>

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

  // <editor-fold desc="Output">
  private _output: string = "";
  get output(): string {
    return this._output;
  }

  set output(value: string) {
    this._output = value;
    this.outputChange.emit(value);
  }

  @Output()
  outputChange = new EventEmitter<string>();

  @Output()
  outputChunksChange = new EventEmitter<string[]>();
  // </editor-fold>

  // <editor-fold desc="Download Progress">
  private _loaded: number = 0;
  get loaded(): number {
    return this._loaded;
  }

  set loaded(value: number) {
    this._loaded = value;
    this.loadedChange.emit(value);
  }

  @Output()
  loadedChange = new EventEmitter<number>();
  // </editor-fold>

  public outputCollapsed = true;

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
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(DOCUMENT) document: Document,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    title: Title,
  ) {
    super(document, title);
  }

  public apiFlag: RequirementInterface = {
    status: RequirementStatus.Pending,
    message: 'Pending',
    contentHtml: 'Activate <span class="code">chrome://flags/#prompt-api-for-gemini-nano-multimodal-input</span>'
  }

  override ngOnInit() {
    super.ngOnInit();

    this.setTitle("Multimodal Prompt API (Experimental) | AI Playground")

    this.subscriptions.push(this.route.queryParams.subscribe((params) => {
      if (params['prompt']) {
        this.promptFormControl.setValue(params['prompt']);
      }
      if (params['promptTypes']) {
        this.promptTypesFormControl.setValue(params['promptTypes']);
      }
    }));

    this.subscriptions.push(this.promptFormControl.valueChanges.subscribe((value) => {
      this.setPrompt(value, {emitChangeEvent: true, emitFormControlEvent: false});
    }));

    this.subscriptions.push(this.promptTypesFormControl.valueChanges.subscribe((value) => {
      this.setPromptTypes(value, {emitChangeEvent: true, emitFormControlEvent: false});
    }));

    this.checkRequirements()
  }

  checkRequirements() {
    if (isPlatformBrowser(this.platformId) && this.window && !("ai" in this.window)) {
      this.apiFlag.status = RequirementStatus.Fail;
      this.apiFlag.message = "'window.ai' is not defined. Activate the flag.";
    } else if (isPlatformBrowser(this.platformId) && this.window && !("languageModel" in this.window.ai)) {
      this.apiFlag.status = RequirementStatus.Fail;
      this.apiFlag.message = "'window.ai.languageModel' is not defined. Activate the flag.";
    } else if(isPlatformBrowser(this.platformId)) {
      this.apiFlag.status = RequirementStatus.Pass;
      this.apiFlag.message = "Passed";
    }
  }

  drop(event: CdkDragDrop<any[]>) {
    // Update your data based on the drop event
    moveItemInArray(this.medias, event.previousIndex, event.currentIndex);
  }

  deleteMedia(index: number) {
    this.medias.splice(index, 1);
  }

  getImageSrc(media: MediaInformationInterface) {
    return URL.createObjectURL(media.content);
  }

  getAudioSrc(media: MediaInformationInterface) {
    return URL.createObjectURL(media.content);
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
        const media: ImageInformationType = {
          type: 'image',
          content: file,
          filename: file.name,
          includeInPrompt: true,
          fileSystemFileHandle,
        };

        this.media = media;
        this.medias.push(media);
      } else if (file.type.startsWith("audio")) {
        const media: AudioInformationType = {
          type: 'audio',
          content: file,
          filename: file.name,
          includeInPrompt: true,
          fileSystemFileHandle,

        };

        this.media = media;
        this.medias.push(media);
      } else {
        this.error = new Error(`Unsupported file type '${file.type}' for '${file.name}'.`);
      }
    })
  }

  availabilityStatus: AvailabilityStatusEnum = AvailabilityStatusEnum.Unknown;

  get checkAvailabilityCode(): string {
    return `window.ai.languageModel.availability({
})`
  }

  async checkAvailability() {
    try {
      this.availabilityStatus = await window.ai.languageModel.availability({})
    } catch (e: any) {
      this.availabilityStatus = AvailabilityStatusEnum.Unavailable
      this.error = e;
    }
  }

  get executeCode(): string {
    return `const languageModel = await window.ai.languageModel.create();

const output = await languageModel.prompt([
  "${this.promptFormControl.value ?? ""}",
  {
    type: "${this.media?.type}",
    content: createImageBitmap(fileSystemFileHandle.getFile()),
  }
]);`;
  }

  async selectAudioSample(audioSample: AudioSampleInterface) {
    // Append to medias but also this.media until we support more than one prompt.
    const audioContext = new AudioContext();
    const audioFile = await fetch(`./audio/${audioSample.filename}`);
    const audioArrayBuffer = await audioFile.arrayBuffer();

    let type = "audio/mpeg";

    switch (audioSample.format) {
      case "wav":
        type = "audio/wav";
        break;
      case "mp3":
        type = "audio/mpeg";
        break;
      default:
        throw new Error(`Unsupported audio format: '${type}'.`);
    }

    const media: MediaInformationInterface = {
      type: 'audio',
      content: new Blob([audioArrayBuffer], {type: type}),
      audioBuffer: await audioContext.decodeAudioData(audioArrayBuffer),
      filename: audioSample.filename,
      includeInPrompt: true,
    };

    this.media = media;

    this.medias.push(media);
  }

  async selectImageSample(imageSample: ImageSampleInterface) {
    const imageFile = await fetch(`./images/${imageSample.filename}`);
    const imageBlob = await imageFile.blob();

    const media: MediaInformationInterface = {
      type: 'image',
      content: imageBlob,
      filename: imageSample.filename,
      includeInPrompt: true,
    };

    this.media = media;
    this.medias.push(media);
  }

  async getMedia(): Promise<HTMLImageElement | HTMLAudioElement | ImageBitmap | AudioBuffer> {
    if(!this.media) {
      throw new Error("No media provided.")
    }

    switch (this.media.type) {
      case 'image':
        return createImageBitmap(this.media.content);

      case 'audio':
        if(!this.media.audioBuffer) {
          throw new Error("Audio buffer invalid.");
        }

        return this.media.audioBuffer;
    }

    throw new Error(`Unsupported media type: '${this.media.type}'.`);
  }

  getDuration(media: MediaInformationInterface) {
    return "00:00:00";
  }

  getChannels(media: MediaInformationInterface) {
    return "stereo";
  }

  async execute() {
    try {
      this.status = TaskStatus.Executing;
      this.outputCollapsed = false;
      this.output = "";
      this.loaded = 0;

      if(!this.media) {
        throw new Error("No media provided.")
      }

      const languageModel = await this.window?.ai.languageModel.create();

      const media = await this.getMedia();

      this.output = await languageModel.prompt([
        {
          type: this.media.type,
          content: media,
        },
        this.promptFormControl.value,
      ]);

      this.status = TaskStatus.Completed;
    } catch (e: any) {
      this.status = TaskStatus.Error;
      this.error = e;
    }
  }

  protected readonly AvailabilityStatusEnum = AvailabilityStatusEnum;
}
