import {Directive, EventEmitter, Inject, Input, Output} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {RequirementStatusInterface} from '../../interfaces/requirement-status.interface';
import {FormControl} from '@angular/forms';
import {LocaleEnum} from '../../enums/locale.enum';
import {DOCUMENT} from '@angular/common';
import {Title} from '@angular/platform-browser';
import {BaseBuiltInApiPageComponent} from '../base/base-built-in-api-page.component';
import {RequirementStatus} from '../../enums/requirement-status.enum';
import {ExecutionPerformanceResultInterface} from '../../interfaces/execution-performance-result.interface';

declare global {
  interface Window { ai: any; }
}


@Directive()
export abstract class BaseWritingAssistanceApiComponent extends BaseBuiltInApiPageComponent {
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

  setUseStreaming(value: boolean | null, options?: {emitChangeEvent: boolean, emitFormControlEvent: boolean}) {
    this._useStreaming = value;
    this.useStreamingFormControl.setValue(value, {emitEvent: options?.emitFormControlEvent ?? true});
    if(options?.emitChangeEvent ?? true) {
      this.useStreamingChange.emit(value);
    }
    this.router.navigate(['.'], { relativeTo: this.route, queryParams: { useStreaming: value}, queryParamsHandling: 'merge' });
  }

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

  setExpectedInputLanguages(value: LocaleEnum[] | null, options?: {emitFormControlEvent?: boolean, emitChangeEvent?: boolean}) {
    this._expectedInputLanguages = value;
    this.expectedInputLanguagesFormControl.setValue(value, {emitEvent: options?.emitFormControlEvent ?? true});
    if(options?.emitChangeEvent ?? true) {
      this.expectedInputLanguagesChange.emit(value);
    }

    this.router.navigate(['.'], { relativeTo: this.route, queryParams: { expectedInputLanguages: value}, queryParamsHandling: 'merge' });
  }

  @Output()
  expectedInputLanguagesChange = new EventEmitter<LocaleEnum[] | null>();

  // </editor-fold>

  // <editor-fold desc="Expected Context Languages">
  private _expectedContextLanguages: LocaleEnum[] | null = [];
  public expectedContextLanguagesFormControl: FormControl<LocaleEnum[] | null> = new FormControl<LocaleEnum[] | null>([]);

  get expectedContextLanguages(): LocaleEnum[] | null {
    return this._expectedContextLanguages;
  }

  @Input()
  set expectedContextLanguages(value: LocaleEnum[] | null) {
    this.setExpectedContextLanguages(value);
  }

  setExpectedContextLanguages(value: LocaleEnum[] | null, options?: {emitFormControlEvent?: boolean, emitChangeEvent?: boolean}) {
    this._expectedContextLanguages = value;
    this.expectedContextLanguagesFormControl.setValue(value, {emitEvent: options?.emitFormControlEvent ?? true});
    if(options?.emitChangeEvent ?? true) {
      this.expectedContextLanguagesChange.emit(value);
    }

    this.router.navigate(['.'], { relativeTo: this.route, queryParams: { expectedContextLanguages: value}, queryParamsHandling: 'merge' });
  }

  @Output()
  expectedContextLanguagesChange = new EventEmitter<LocaleEnum[] | null>();
  // </editor-fold>

  // <editor-fold desc="OutputLanguage">
  private _outputLanguage: LocaleEnum | null = null;
  public outputLanguageFormControl: FormControl<LocaleEnum | null> = new FormControl<LocaleEnum | null>(LocaleEnum.en);

  get outputLanguage(): LocaleEnum | null {
    return this._outputLanguage;
  }

  @Input()
  set outputLanguage(value: LocaleEnum | null) {
    this.setOutputLanguage(value);
  }

  setOutputLanguage(value: LocaleEnum | null, options?: {emitFormControlEvent?: boolean, emitChangeEvent?: boolean}) {
    this._outputLanguage = value;
    this.outputLanguageFormControl.setValue(value, {emitEvent: options?.emitFormControlEvent ?? true});
    if(options?.emitChangeEvent ?? true) {
      this.outputLanguageChange.emit(value);
    }

    this.router.navigate(['.'], { relativeTo: this.route, queryParams: { outputLanguage: value}, queryParamsHandling: 'merge' });
  }

  @Output()
  outputLanguageChange = new EventEmitter<LocaleEnum | null>();
  // </editor-fold>

  // <editor-fold desc="Context">
  private _context: string | null = null;
  public contextFormControl = new FormControl<string | null>("");

  get context(): string | null {
    return this._context;
  }

  @Input()
  set context(value: string | null) {
    this.setContext(value);
  }

  setContext(value: string | null, options?: {emitFormControlEvent?: boolean, emitChangeEvent?: boolean}) {
    this._context = value;
    this.contextFormControl.setValue(value, {emitEvent: options?.emitFormControlEvent ?? true});
    if(options?.emitChangeEvent ?? true) {
      this.contextChange.emit(value);
    }

    this.router.navigate(['.'], { relativeTo: this.route, queryParams: { context: value}, queryParamsHandling: 'merge' });
  }

  @Output()
  contextChange = new EventEmitter<string | null>();
  // </editor-fold>

  // <editor-fold desc="Input">
  private _input: string | null = null;
  public inputFormControl: FormControl<string | null> = new FormControl<string | null>(null);

  get input(): string | null {
    return this._input;
  }

  @Input()
  set input(value: string | null) {
    this.setInput(value);
  }

  setInput(value: string | null, options?: {updateFormControl?: boolean, emitFormControlEvent?: boolean, emitChangeEvent?: boolean}) {
    this._input = value;
    if(options?.updateFormControl) {
      this.inputFormControl.setValue(value, {emitEvent: options?.emitFormControlEvent ?? true});
    }

    if(options?.emitChangeEvent ?? true) {
      this.inputChange.emit(value);
    }

    this.router.navigate(['.'], { relativeTo: this.route, queryParams: { input: value}, queryParamsHandling: 'merge' });
  }

  @Output()
  inputChange = new EventEmitter<string | null>();
  // </editor-fold>

  // <editor-fold desc="Shared Context">
  private _sharedContext: string | null = null;
  public sharedContextFormControl = new FormControl<string | null>("");

  get sharedContext(): string | null {
    return this._sharedContext;
  }

  @Input()
  set sharedContext(value: string | null) {
    this.setSharedContext(value);
  }

  setSharedContext(value: string | null, options?: {emitFormControlEvent?: boolean, emitChangeEvent?: boolean}) {
    this._sharedContext = value;
    this.sharedContextFormControl.setValue(value, {emitEvent: options?.emitFormControlEvent ?? true});
    if(options?.emitChangeEvent ?? true) {
      this.sharedContextChange.emit(value);
    }

    this.router.navigate(['.'], { relativeTo: this.route, queryParams: { sharedContext: value}, queryParamsHandling: 'merge' });
  }

  @Output()
  sharedContextChange = new EventEmitter<string | null>();
  // </editor-fold>

  @Output()
  errorChange = new EventEmitter<Error>();

  public apiFlag: RequirementStatusInterface = {
    status: RequirementStatus.Pending,
    message: 'Pending',

  }

  private executionTimeInterval: any;

  constructor(
    @Inject(DOCUMENT) document: Document,
    router: Router,
    route: ActivatedRoute,
    title: Title,
    ) {
    super(document, title, router, route);
  }

  override ngOnInit() {
    super.ngOnInit();

    this.subscriptions.push(this.useStreamingFormControl.valueChanges.subscribe((value) => {
      this.setUseStreaming(value, {emitChangeEvent: true, emitFormControlEvent: false});
    }));

    this.subscriptions.push(this.expectedInputLanguagesFormControl.valueChanges.subscribe((value) => {
      this.setExpectedInputLanguages(value, {emitChangeEvent: true, emitFormControlEvent: false});
    }));
    this.subscriptions.push(this.expectedContextLanguagesFormControl.valueChanges.subscribe((value) => {
      this.setExpectedContextLanguages(value, {emitChangeEvent: true, emitFormControlEvent: false});
    }));
    this.subscriptions.push(this.outputLanguageFormControl.valueChanges.subscribe((value) => {
      this.setOutputLanguage(value, {emitChangeEvent: true, emitFormControlEvent: false});
    }));

    this.subscriptions.push(this.sharedContextFormControl.valueChanges.subscribe((value) => {
      this.setSharedContext(value, {emitChangeEvent: true, emitFormControlEvent: false});
    }));
    this.subscriptions.push(this.inputFormControl.valueChanges.subscribe((value) => {
      this.setInput(value, {updateFormControl: false, emitChangeEvent: true, emitFormControlEvent: false});
    }));
    this.subscriptions.push(this.contextFormControl.valueChanges.subscribe((value) => {
      this.setContext(value, {emitChangeEvent: true, emitFormControlEvent: false});
    }));

    this.subscriptions.push(this.route.queryParams.subscribe((params) => {
      if(params["useStreaming"]) {
        this.useStreamingFormControl.setValue(params["useStreaming"] === "true");
      }

      if (params['input']) {
        this.inputFormControl.setValue(params['input']);
      }

      if (params['context']) {
        this.contextFormControl.setValue(params['context']);
      }

      if (params['sharedContext']) {
        this.sharedContextFormControl.setValue(params['sharedContext']);
      }

      if (params['expectedInputLanguages']) {
        if (!Array.isArray(params['expectedInputLanguages'])) {
          this.expectedInputLanguagesFormControl.setValue([params['expectedInputLanguages']]);
        } else {
          this.expectedInputLanguagesFormControl.setValue(params['expectedInputLanguages']);
        }

      }
      if (params['expectedContextLanguages']) {
        if (!Array.isArray(params['expectedContextLanguages'])) {
          this.expectedContextLanguagesFormControl.setValue([params['expectedContextLanguages']]);
        } else {
          this.expectedContextLanguagesFormControl.setValue(params['expectedContextLanguages']);
        }
      }

      if (params['outputLanguage']) {
        this.outputLanguageFormControl.setValue(params['outputLanguage']);
      }
    }));
  }

  abortTriggered() {
    console.log(`abortTriggered`)
    this.abortController?.abort();
  }

  abortFromCreateTriggered() {
    console.log(`abortFromCreateTriggered`)
    this.abortControllerFromCreate?.abort();
  }
}
