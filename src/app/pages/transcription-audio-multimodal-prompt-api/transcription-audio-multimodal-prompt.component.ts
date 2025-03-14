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

  // <editor-fold desc="ChunkInterval">
  private _chunkInterval: number | null = 1000;
  public chunkIntervalFormControl = new FormControl(1000);

  get chunkInterval(): number | null {
    return this._chunkInterval;
  }

  set chunkInterval(value: number | null) {
    this.setChunkInterval(value);
  }

  setChunkInterval(value: number | null, options?: {emitFormControlEvent?: boolean, emitChangeEvent?: boolean, setFormControlValue?: boolean}) {
    this._chunkInterval = value;

    if(options?.setFormControlValue !== false) { // By default we set the form contro lvalue
      this.chunkIntervalFormControl.setValue(value, {emitEvent: options?.emitFormControlEvent ?? true});
    }

    this.router.navigate(['.'], { relativeTo: this.route, queryParams: { chunkInterval: value}, queryParamsHandling: 'merge' });
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

  autoRestartInterval?: any;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(DOCUMENT) document: Document,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    title: Title,

    private readonly audioRecordingService: AudioRecordingService,
  ) {
    super(document, title);
  }

  override ngOnInit() {
    super.ngOnInit();

    this.setTitle("Transcription (using Audio Prompt API (Experimental)) | AI Playground");

    this.checkRequirements();

    this.subscriptions.push(this.chunkIntervalFormControl.valueChanges.subscribe((value) => {
      this.setChunkInterval(value, {emitFormControlEvent: false, setFormControlValue: false});
    }));

    this.subscriptions.push(this.route.queryParams.subscribe((params) => {
      if (params['chunkInterval']) {
        this.setChunkInterval(params['chunkInterval']);
      }
    }))
  }

  ngAfterViewInit() {
    if(isPlatformBrowser(this.platformId) && this.canvasElement) {
      this.audioRecordingService.init(this.canvasElement)
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

    const self = this;
    this.audioRecordingService.chunkAvailableCallback = (chunk: any) => {
      self.chunkAvailable(chunk);
    }

    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    this.audioRecordingService.startRecording(this.stream);

    // Restart data stream
    this.autoRestartInterval = setInterval(() => {
      this.audioRecordingService.stopRecordingWithoutBlob();

      this.audioRecordingService.startRecording(self.stream!);
    }, this.chunkInterval ?? 1000);
  }

  async chunkAvailable(chunk: any) {
    this.outputCollapsed = false;
    this.status = TaskStatus.Executing

    try {
      const blob = new Blob([chunk], {type: this.audioRecordingService.mediaRecorder?.mimeType});
      const prompt = `Transcribe this`;

      const audioContext = new AudioContext();
      const audioBuffer = await audioContext.decodeAudioData(await blob.arrayBuffer());

      const languageModel = await this.window?.ai.languageModel.create();

      const result= await languageModel.prompt([
        prompt,
        {
          type: 'audio',
          content: audioBuffer,
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
    clearInterval(this.autoRestartInterval);

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
}
