import {Component, ElementRef, Inject, OnDestroy, OnInit, PLATFORM_ID, DOCUMENT} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {TaskStatus} from '../../enums/task-status.enum';
import {isPlatformServer} from '@angular/common';
import {BaseComponent} from '../base/base.component';
import {FormControl} from '@angular/forms';

@Component({
  selector: 'app-audio-prompt-from-file',
  templateUrl: './audio-prompt-from-file.component.html',
  standalone: false,
  styleUrl: './audio-prompt-from-file.component.scss'
})
export class AudioPromptFromFileComponent extends BaseComponent implements OnInit, OnDestroy {
  // <editor-fold desc="Audio URL Prompt">
  private _prompt: string | null = "";
  public promptFormControl = new FormControl('');

  get prompt(): string | null {
    return this._prompt;
  }

  set prompt(value: string | null) {
    this.setPrompt(value);
  }

  setPrompt(value: string | null, options?: {emitFormControlEvent?: boolean, emitChangeEvent?: boolean, setFormControlValue?: boolean}) {
    this._prompt = value;

    if(options?.setFormControlValue !== false) { // By default we set the form contro lvalue
      this.promptFormControl.setValue(value, {emitEvent: options?.emitFormControlEvent ?? true});
    }

    this.router.navigate(['.'], { relativeTo: this.route, queryParams: { audioFilePrompt: value}, queryParamsHandling: 'merge' });
  }
  // </editor-fold>

  private fileSystemFileHandle?: FileSystemFileHandle

  public audioSrc?: string;

  public error?: Error;

  public output: string = "";

  public outputCollapsed = true;

  public outputComponent?: ElementRef;

  public status: TaskStatus = TaskStatus.Idle;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(DOCUMENT) document: Document,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
  ) {
    super(document);
  }

  override ngOnInit() {
    super.ngOnInit();

    this.subscriptions.push(this.promptFormControl.valueChanges.subscribe((value) => {
      this.setPrompt(value, {emitFormControlEvent: false, setFormControlValue: false});
    }));


    this.subscriptions.push(this.route.queryParams.subscribe((params) => {

      if (params['audioFilePrompt']) {
        this.setPrompt(params['audioFilePrompt']);
      }
    }));
  }

  override ngOnDestroy() {
    super.ngOnDestroy();
  }

  onFileSystemHandlesDropped(fileSystemHandles: FileSystemHandle[]) {
    fileSystemHandles.forEach(async (fileSystemHandle) => {
      if (fileSystemHandle.kind === "directory") {
        return;
      }

      const fileSystemFileHandle = fileSystemHandle as FileSystemFileHandle;
      const file = await fileSystemFileHandle.getFile()

      if (file.type.startsWith("audio")) {
        this.fileSystemFileHandle = fileSystemHandle as FileSystemFileHandle;
        this.audioSrc = URL.createObjectURL(file);
      } else {
        this.error = new Error(`Unsupported file type '${file.type}' for '${file.name}'.`);
        this.outputCollapsed = false;
        this.status = TaskStatus.Error;
      }
    })
  }

  get code() {
    return `const [fileHandle] = await window.showOpenFilePicker(pickerOpts); // See https://developer.mozilla.org/en-US/docs/Web/API/Window/showOpenFilePicker
const file = await options.fileSystemFileHandle.getFile();

const prompt = '${this.prompt}';

const audioContext = new AudioContext();
const audioBuffer = await audioContext.decodeAudioData(await file.arrayBuffer());

const languageModel = await this.window?.ai.languageModel.create();
await languageModel.prompt([
prompt,
{
  type: 'audio',
  content: audioBuffer,
}
]);`;
  }

  async execute() {
    if(isPlatformServer(this.platformId)) {
      return;
    }

    this.outputCollapsed = false;
    this.output = "";
    this.status = TaskStatus.Executing

    if(!this.fileSystemFileHandle) {
      this.status = TaskStatus.Error;
      this.error = new Error("You must drop an audio file first.");
      return;
    }

    this.outputComponent?.nativeElement.scrollIntoView();

    try {
      const file = await this.fileSystemFileHandle.getFile();

      const prompt = '${this.prompt}';

      const audioContext = new AudioContext();
      const audioBuffer = await audioContext.decodeAudioData(await file.arrayBuffer());

      const languageModel = await this.window?.ai.languageModel.create({
        expectedInputs: [
          { type: "audio" },
        ]
      });

      this.output = await languageModel.prompt([
        prompt,
        {
          type: 'audio',
          content: audioBuffer,
        }
      ]);
      this.status = TaskStatus.Completed;
    } catch (e: any) {
      this.status = TaskStatus.Error;
      this.error = e;
    }
  }
}
