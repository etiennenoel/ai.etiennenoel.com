import {AfterViewInit, Component, ElementRef, Inject, OnInit, PLATFORM_ID, ViewChild} from '@angular/core';
import {BasePageComponent} from '../../components/base/base-page.component';
import {RequirementInterface} from '../../interfaces/requirement.interface';
import {RequirementStatus} from '../../enums/requirement-status.enum';
import {DOCUMENT, isPlatformBrowser} from '@angular/common';
import {ActivatedRoute, Router} from '@angular/router';
import {Title} from '@angular/platform-browser';
import {TaskStatus} from '../../enums/task-status.enum';
import {AudioRecordingService} from '../../services/audio-recording.service';
import {FormControl} from '@angular/forms';
import {processStream} from '../../audio-processing-module/main';
import {AudioVisualizerService} from '../../services/audio-visualizer.service';
import {
  CHUNK_SIZE,
  MIC_SAMPLE_RATE,
  SILENCE_RMS,
  STEP_SIZE,
  WINDOW
} from '../../audio-processing-module/constants';


@Component({
  selector: 'app-transcription-audio-multimodal-chunkInterval',
  templateUrl: './transcription-audio-multimodal-prompt.component.html',
  standalone: false,
  styleUrl: './transcription-audio-multimodal-prompt.component.scss'
})
export class TranscriptionAudioMultimodalPromptComponent extends BasePageComponent implements OnInit, AfterViewInit {

  public apiFlag: RequirementInterface = {
    status: RequirementStatus.Pending,
    message: 'Pending',
    contentHtml: 'Activate <span class="code">chrome://flags/#chunkInterval-api-for-gemini-nano-multimodal-input</span>'
  }

  // <editor-fold desc="Mic Sample Rate">
  private _micSampleRate: number | null = MIC_SAMPLE_RATE;
  public micSampleRateFormControl = new FormControl(MIC_SAMPLE_RATE);

  get micSampleRate(): number | null {
    return this._micSampleRate;
  }

  set micSampleRate(value: number | null) {
    this.setMicSampleRate(value);
  }

  setMicSampleRate(value: number | null, options?: {emitFormControlEvent?: boolean, emitChangeEvent?: boolean, setFormControlValue?: boolean}) {
    this._micSampleRate = value;

    if(options?.setFormControlValue !== false) { // By default we set the form contro lvalue
      this.micSampleRateFormControl.setValue(value, {emitEvent: options?.emitFormControlEvent ?? true});
    }

    this.router.navigate(['.'], { relativeTo: this.route, queryParams: { micSampleRate: value}, queryParamsHandling: 'merge' });
  }
  // </editor-fold>

  // <editor-fold desc="Chunk Size">
  private _chunkSize: number | null = CHUNK_SIZE;
  public chunkSizeFormControl = new FormControl(CHUNK_SIZE);

  get chunkSize(): number | null {
    return this._chunkSize;
  }

  set chunkSize(value: number | null) {
    this.setChunkSize(value);
  }

  setChunkSize(value: number | null, options?: {emitFormControlEvent?: boolean, emitChangeEvent?: boolean, setFormControlValue?: boolean}) {
    this._chunkSize = value;

    if(options?.setFormControlValue !== false) { // By default we set the form contro lvalue
      this.chunkSizeFormControl.setValue(value, {emitEvent: options?.emitFormControlEvent ?? true});
    }

    this.router.navigate(['.'], { relativeTo: this.route, queryParams: { chunkSize: value}, queryParamsHandling: 'merge' });
  }
  // </editor-fold>

  // <editor-fold desc="Step Size">
  private _stepSize: number | null = STEP_SIZE;
  public stepSizeFormControl = new FormControl(STEP_SIZE);

  get stepSize(): number | null {
    return this._stepSize;
  }

  set stepSize(value: number | null) {
    this.setStepSize(value);
  }

  setStepSize(value: number | null, options?: {emitFormControlEvent?: boolean, emitChangeEvent?: boolean, setFormControlValue?: boolean}) {
    this._stepSize = value;

    if(options?.setFormControlValue !== false) { // By default we set the form contro lvalue
      this.stepSizeFormControl.setValue(value, {emitEvent: options?.emitFormControlEvent ?? true});
    }

    this.router.navigate(['.'], { relativeTo: this.route, queryParams: { stepSize: value}, queryParamsHandling: 'merge' });
  }
  // </editor-fold>

  // <editor-fold desc="Silence RMS">
  private _silenceRms: number | null = SILENCE_RMS;
  public silenceRmsFormControl = new FormControl(SILENCE_RMS);

  get silenceRms(): number | null {
    return this._silenceRms;
  }

  set silenceRms(value: number | null) {
    this.setSilenceRms(value);
  }

  setSilenceRms(value: number | null, options?: {emitFormControlEvent?: boolean, emitChangeEvent?: boolean, setFormControlValue?: boolean}) {
    this._silenceRms = value;

    if(options?.setFormControlValue !== false) { // By default we set the form contro lvalue
      this.silenceRmsFormControl.setValue(value, {emitEvent: options?.emitFormControlEvent ?? true});
    }

    this.router.navigate(['.'], { relativeTo: this.route, queryParams: { silenceRms: value}, queryParamsHandling: 'merge' });
  }
  // </editor-fold>

  // <editor-fold desc="Window">
  private _windowAudio: number | null = WINDOW;
  public windowAudioFormControl = new FormControl(WINDOW);

  get windowAudio(): number | null {
    return this._windowAudio;
  }

  set windowAudio(value: number | null) {
    this.setWindowAudio(value);
  }

  setWindowAudio(value: number | null, options?: {emitFormControlEvent?: boolean, emitChangeEvent?: boolean, setFormControlValue?: boolean}) {
    this._windowAudio = value;

    if(options?.setFormControlValue !== false) { // By default we set the form contro lvalue
      this.windowAudioFormControl.setValue(value, {emitEvent: options?.emitFormControlEvent ?? true});
    }

    this.router.navigate(['.'], { relativeTo: this.route, queryParams: { windowAudio: value}, queryParamsHandling: 'merge' });
  }
  // </editor-fold>

  status: TaskStatus = TaskStatus.Idle;

  public error?: Error;

  @ViewChild("outputComponent")
  public outputComponent?: ElementRef;

  public output: string = "";
  public outputCollapsed = false;

  public isRecording = false;

  public recordingStartTime?: number;

  public recordingDuration?: string;

  public recordingInterval?: any;

  @ViewChild("canvasElement")
  public canvasElement?: ElementRef;

  public audioBlob?: Blob;

  public audioSrc?: string;

  public stream?: MediaStream;

  public languageModel?: any;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(DOCUMENT) document: Document,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    title: Title,

    private readonly audioRecordingService: AudioRecordingService,
    private readonly audioVisualizerService: AudioVisualizerService,
  ) {
    super(document, title);
  }

  override async ngOnInit() {
    super.ngOnInit();

    this.setTitle("Transcription (using Audio Prompt API (Experimental)) | AI Playground");

    this.checkRequirements();

    this.subscriptions.push(this.micSampleRateFormControl.valueChanges.subscribe((value) => {
      this.setMicSampleRate(value, {emitFormControlEvent: false, setFormControlValue: false});
    }));
    this.subscriptions.push(this.chunkSizeFormControl.valueChanges.subscribe((value) => {
      this.setChunkSize(value, {emitFormControlEvent: false, setFormControlValue: false});
    }));
    this.subscriptions.push(this.stepSizeFormControl.valueChanges.subscribe((value) => {
      this.setStepSize(value, {emitFormControlEvent: false, setFormControlValue: false});
    }));
    this.subscriptions.push(this.silenceRmsFormControl.valueChanges.subscribe((value) => {
      this.setSilenceRms(value, {emitFormControlEvent: false, setFormControlValue: false});
    }));
    this.subscriptions.push(this.windowAudioFormControl.valueChanges.subscribe((value) => {
      this.setWindowAudio(value, {emitFormControlEvent: false, setFormControlValue: false});
    }));

    this.subscriptions.push(this.route.queryParams.subscribe((params) => {
      if (params['micSampleRate']) {
        this.setMicSampleRate(params['micSampleRate']);
      }
      if (params['chunkSize']) {
        this.setChunkSize(params['chunkSize']);
      }
      if (params['stepSize']) {
        this.setStepSize(params['stepSize']);
      }
      if (params['silenceRms']) {
        this.setSilenceRms(params['silenceRms']);
      }
      if (params['window']) {
        this.setWindowAudio(params['window']);
      }
    }))

    this.languageModel = await this.window?.ai.languageModel.create();
  }

  ngAfterViewInit() {
    if(isPlatformBrowser(this.platformId) && this.canvasElement) {
      this.audioVisualizerService.init(this.canvasElement)
    }
  }

  checkRequirements() {
    if (isPlatformBrowser(this.platformId) && this.window && !("ai" in this.window)) {
      this.apiFlag.status = RequirementStatus.Fail;
      this.apiFlag.message = "'window.ai' is not defined. Activate the flag.";
    } else if (isPlatformBrowser(this.platformId) && this.window && !("languageModel" in this.window.ai)) {
      this.apiFlag.status = RequirementStatus.Fail;
      this.apiFlag.message = "'window.ai.languageModel' is not defined. Activate the flag.";
    } else if (isPlatformBrowser(this.platformId)) {
      this.apiFlag.status = RequirementStatus.Pass;
      this.apiFlag.message = "Passed";
    }
  }

  async startTranscribing() {
    this.isRecording = true;
    this.recordingStartTime = Date.now();
    this.output = "";

    this.recordingInterval = setInterval(() => {
      this.updateRecordingDuration();
    }, 500)

    if(!this.canvasElement) {
      return;
    }

    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    this.audioVisualizerService.visualize(this.stream);

    for await (const chunk of processStream(this.stream, {
      stepSize: this.stepSize ?? STEP_SIZE,
      chunkSize: this.chunkSize ?? CHUNK_SIZE,
      micSampleRate: this.micSampleRate ?? MIC_SAMPLE_RATE,
      silenceRMS: this.silenceRms ?? SILENCE_RMS,
      window: this.windowAudio ?? WINDOW,
    })) {
      await this.chunkAvailable(chunk)
    }
  }

  async chunkAvailable(chunk: any) {
    this.outputCollapsed = false;
    this.status = TaskStatus.Executing

    try {
      if(!this.languageModel) {
        throw new Error("Language model not loaded");
      }

      const prompt = `Transcribe this`;

      const result= await this.languageModel.prompt([
        prompt,
        {
          type: 'audio',
          content: chunk,
        }
      ]);

      console.log(result);

      this.output += result;
      this.status = TaskStatus.Completed;

    } catch (e: any) {
      this.status = TaskStatus.Error;
      this.error = e;
    }
  }

  async stopTranscription() {
    this.isRecording = false;

    clearInterval(this.recordingInterval);

    // Call it one last time to update the true duration.
    this.updateRecordingDuration();

    this.stream?.getAudioTracks().forEach((track: any) => {
      track.stop();
    });
  }

  updateRecordingDuration() {
    if(this.recordingStartTime) {
      const duration = Date.now() - this.recordingStartTime;

      this.recordingDuration = new Date(duration).toISOString().substr(11, 8);
    }
  }
}
