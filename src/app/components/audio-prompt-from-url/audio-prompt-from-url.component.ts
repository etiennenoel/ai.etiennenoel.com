import {Component, Inject, OnDestroy, OnInit, PLATFORM_ID} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {TaskStatus} from '../../enums/task-status.enum';
import {DOCUMENT, isPlatformServer} from '@angular/common';
import {BaseComponent} from '../base/base.component';
import {FormControl} from '@angular/forms';

@Component({
  selector: 'app-audio-prompt-from-url',
  templateUrl: './audio-prompt-from-url.component.html',
  standalone: false,
  styleUrl: './audio-prompt-from-url.component.scss'
})
export class AudioPromptFromUrlComponent extends BaseComponent implements OnInit, OnDestroy {
  // <editor-fold desc="Audio URL Prompt">
  private _audioUrlPrompt: string | null = "";
  public audioUrlPromptFormControl = new FormControl('');

  get audioUrlPrompt(): string | null {
    return this._audioUrlPrompt;
  }

  set audioUrlPrompt(value: string | null) {
    this.setAudioUrlPrompt(value);
  }

  setAudioUrlPrompt(value: string | null, options?: {emitFormControlEvent?: boolean, emitChangeEvent?: boolean, setFormControlValue?: boolean}) {
    this._audioUrlPrompt = value;

    if(options?.setFormControlValue !== false) { // By default we set the form contro lvalue
      this.audioUrlPromptFormControl.setValue(value, {emitEvent: options?.emitFormControlEvent ?? true});
    }

    this.router.navigate(['.'], { relativeTo: this.route, queryParams: { audioUrlPrompt: value}, queryParamsHandling: 'merge' });
  }
  // </editor-fold>

  public audioSrc?: string;

  // <editor-fold desc="Audio URL">
  public _audioUrl: string | null = "";
  public audioUrlFormControl = new FormControl('');

  get audioUrl(): string | null {
    return this._audioUrl;
  }

  set audioUrl(value: string | null) {
    this.setAudioUrl(value);
  }

  setAudioUrl(value: string | null, options?: {emitFormControlEvent?: boolean, emitChangeEvent?: boolean, setFormControlValue?: boolean}) {
    this._audioUrl = value;

    if(options?.setFormControlValue !== false) { // By default we set the form contro lvalue
      this.audioUrlFormControl.setValue(value, {emitEvent: options?.emitFormControlEvent ?? true});
    }

    this.router.navigate(['.'], { relativeTo: this.route, queryParams: { audioUrl: value}, queryParamsHandling: 'merge' });
  }

  // </editor-fold>

  public error?: Error;

  public output: string = "";

  public outputCollapsed = true;

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

    this.subscriptions.push(this.audioUrlPromptFormControl.valueChanges.subscribe((value) => {
      this.setAudioUrlPrompt(value, {emitFormControlEvent: false, setFormControlValue: false});
    }));

    this.subscriptions.push(this.audioUrlFormControl.valueChanges.subscribe(async (value) => {
      this.setAudioUrl(value, {emitFormControlEvent: false, setFormControlValue: false});

      if (!value || isPlatformServer(this.platformId)) {
        return;
      }

      const audioContext = new AudioContext();
      try {
        const response = await fetch(`${value}`);

        if(response.status !== 200) {
          this.audioSrc = undefined;
          return;
        }

        const arrayBuffer = await response.arrayBuffer();
        const type = value.split('.').pop() ?? "";
        const blob = new Blob([arrayBuffer], {type: type});

        this.audioSrc = URL.createObjectURL(blob);
      } catch (e) {
        this.audioSrc = undefined;
      }
    }));

    this.subscriptions.push(this.route.queryParams.subscribe((params) => {
      if (params['audioUrl']) {
        this.setAudioUrl(params['audioUrl']);
      }
      if (params['audioUrlPrompt']) {
        this.setAudioUrlPrompt(params['audioUrlPrompt']);
      }
    }));
  }

  override ngOnDestroy() {
    super.ngOnDestroy();
  }

  get audioUrlCode() {
    return `const url = '${this.audioUrl}';
const prompt = '${this.audioUrlPrompt}';

const response = await fetch(url);
const audioContext = new AudioContext();
const audioBuffer = await audioContext.decodeAudioData(await response.arrayBuffer());

const languageModel = await this.window?.ai.languageModel.create();
await languageModel.prompt([
prompt,
{
  type: 'audio',
  content: audioBuffer,
}
]);
    `;
  }

  async execute() {
    if(isPlatformServer(this.platformId)) {
      return;
    }

    if(!this.audioUrl) {
      this.error = new Error("The audio Url cannot be empty");
      return;
    }

    this.outputCollapsed = false;
    this.output = "";
    this.status = TaskStatus.Executing

    try {
      const response = await fetch(this.audioUrl);

      if(response.status !== 200) {
        this.error = new Error("The audio Url is invalid");
        return;
      }

      const audioContext = new AudioContext();
      const audioBuffer = await audioContext.decodeAudioData(await response.arrayBuffer());

      const languageModel = await this.window?.ai.languageModel.create();
      this.output = await languageModel.prompt([
        this.audioUrlPrompt,
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
