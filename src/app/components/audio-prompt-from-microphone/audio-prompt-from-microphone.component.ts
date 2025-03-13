import {AfterViewInit, Component, ElementRef, Inject, OnDestroy, OnInit, PLATFORM_ID, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {TaskStatus} from '../../enums/task-status.enum';
import {DOCUMENT, isPlatformBrowser, isPlatformServer} from '@angular/common';
import {BaseComponent} from '../base/base.component';
import {FormControl} from '@angular/forms';
import {AudioRecordingService} from '../../services/audio-recording.service';

@Component({
  selector: 'app-audio-prompt-from-microphone',
  templateUrl: './audio-prompt-from-microphone.component.html',
  standalone: false,
  styleUrl: './audio-prompt-from-microphone.component.scss'
})
export class AudioPromptFromMicrophoneComponent extends BaseComponent implements OnInit, OnDestroy, AfterViewInit {
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

  public isRecording = false;

  public recordingStartTime?: number;

  public recordingDuration?: string;

  public recordingInterval?: any;

  public audioSrc?: string;

  public error?: Error;

  public output: string = "";

  public outputCollapsed = true;

  public audioBlob?: Blob;

  @ViewChild("outputComponent")
  public outputComponent?: ElementRef;

  public status: TaskStatus = TaskStatus.Idle;

  @ViewChild("canvasElement")
  public canvasElement?: ElementRef;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(DOCUMENT) document: Document,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly audioRecordingService: AudioRecordingService,
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

  ngAfterViewInit() {
    if(isPlatformBrowser(this.platformId) && this.canvasElement) {
      this.audioRecordingService.init(this.canvasElement)
    }
  }

  async startRecording() {
    this.isRecording = true;
    this.recordingStartTime = Date.now();

    this.recordingInterval = setInterval(() => {
      this.updateRecordingDuration();
    }, 500)

    if(!this.canvasElement) {
      return;
    }

    await this.audioRecordingService.startRecording();
  }

  async stopRecording() {
    this.isRecording = false;

    clearInterval(this.recordingInterval);

    // Call it one last time to update the true duration.
    this.updateRecordingDuration();

    this.audioBlob = await this.audioRecordingService.stopRecording();
    this.audioSrc = URL.createObjectURL(this.audioBlob);
  }

  updateRecordingDuration() {
    if(this.recordingStartTime) {
      const duration = Date.now() - this.recordingStartTime;

      this.recordingDuration = new Date(duration).toISOString().substr(11, 8);
    }
  }

  get code() {
    return ``;
  }

  async execute() {
    if(isPlatformServer(this.platformId)) {
      return;
    }

    this.outputCollapsed = false;
    this.output = "";
    this.status = TaskStatus.Executing

    this.outputComponent?.nativeElement?.scrollIntoView();

    if(!this.audioBlob) {
      this.status = TaskStatus.Error;
      this.error = new Error("No audio blob to process");
      return;
    }

    try {
      const prompt = `${this.prompt}`;

      const audioContext = new AudioContext();
      const audioBuffer = await audioContext.decodeAudioData(await this.audioBlob.arrayBuffer());

      const languageModel = await this.window?.ai.languageModel.create();

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
