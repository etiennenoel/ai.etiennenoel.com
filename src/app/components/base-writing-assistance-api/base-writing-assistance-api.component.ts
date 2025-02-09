import {Component, Directive, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {RouterOutlet} from "@angular/router";
import {TaskStatus} from '../../enums/task-status.enum';
import {Subscription} from 'rxjs';
import {BaseComponent} from '../base/base.component';
import {AvailabilityStatusEnum} from '../../enums/availability-status.enum';
import {RequirementStatusInterface} from '../../interfaces/requirement-status.interface';
import {RequirementStatus} from '../../enums/requirement-status.enum';
import {FormControl} from '@angular/forms';
import {ExecutionPerformanceResultInterface} from '../../interfaces/execution-performance-result.interface';
import {LocaleEnum} from '../../enums/locale.enum';

declare global {
  interface Window { ai: any; }
}


@Directive()
export abstract class BaseWritingAssistanceApiComponent extends BaseComponent {

  public availabilityStatus: AvailabilityStatusEnum = AvailabilityStatusEnum.Unknown;

  // <editor-fold desc="Use Streaming">
  private _useStreaming: boolean | null = false;
  public useStreamingFormControl = new FormControl<boolean>(false);
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
  }

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

  // <editor-fold desc="Execution Performance Result">
  executionPerformance: ExecutionPerformanceResultInterface = {
    startedExecutionAt: 0,
    firstResponseIn: 0,
    elapsedTime: 0,
    totalExecutionTime: 0,
    firstResponseNumberOfWords: 0,
    totalNumberOfWords: 0
  }

  @Output()
  executionPerformanceChange: EventEmitter<ExecutionPerformanceResultInterface> = new EventEmitter<ExecutionPerformanceResultInterface>();
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
  }

  @Output()
  expectedContextLanguagesChange = new EventEmitter<LocaleEnum[] | null>();
  // </editor-fold>

  // <editor-fold desc="OutputLanguage">
  private _outputLanguage: LocaleEnum | null = null;
  public outputLanguageFormControl: FormControl<LocaleEnum | null> = new FormControl<LocaleEnum | null>(null);

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
  }

  @Output()
  outputLanguageChange = new EventEmitter<LocaleEnum | null>();
  // </editor-fold>

  // <editor-fold desc="AbortControllerFromCreate">
  private _abortControllerFromCreate: AbortController | null = null;

  get abortControllerFromCreate(): AbortController | null {
    return this._abortControllerFromCreate;
  }

  set abortControllerFromCreate(value: AbortController | null) {
    this._abortControllerFromCreate = value;
    this.abortControllerFromCreateChange.emit(value);
  }

  @Output()
  abortControllerFromCreateChange = new EventEmitter<AbortController | null>();
  // </editor-fold>

  // <editor-fold desc="AbortController">
  private _abortController: AbortController | null = null;

  get abortController(): AbortController | null {
    return this._abortController;
  }

  set abortController(value: AbortController | null) {
    this._abortController = value;
    this.abortControllerChange.emit(value);
  }

  @Output()
  abortControllerChange = new EventEmitter<AbortController | null>();
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

  @Output()
  errorChange = new EventEmitter<Error>();

  public apiFlag: RequirementStatusInterface = {
    status: RequirementStatus.Pending,
    message: 'Pending'
  }

  private executionTimeInterval: any;

  public outputChunks: string[] = [];

  override ngOnInit() {
    super.ngOnInit();

    this.subscriptions.push(this.useStreamingFormControl.valueChanges.subscribe((value) => {
      this.setUseStreaming(value, {emitChangeEvent: true, emitFormControlEvent: false});
    }));
  }

  emitExecutionPerformanceChange() {
    this.executionPerformanceChange.emit(this.executionPerformance);
  }

  startExecutionTime() {
    this.stopExecutionTime()

    this.executionPerformance.firstResponseIn = 0;
    this.executionPerformance.elapsedTime = 0;
    this.executionPerformance.startedExecutionAt = performance.now();
    this.executionPerformance.totalExecutionTime = 0;

    this.emitExecutionPerformanceChange();

    this.executionTimeInterval = setInterval(() => {
      this.executionPerformance.elapsedTime = Math.round(performance.now() - this.executionPerformance.startedExecutionAt);
      this.emitExecutionPerformanceChange();
    }, 50);
  }

  lapFirstResponseTime() {
    this.executionPerformance.firstResponseIn = Math.round(performance.now() - this.executionPerformance.startedExecutionAt);
    this.emitExecutionPerformanceChange();
  }

  stopExecutionTime() {
    this.executionPerformance.totalExecutionTime = Math.round(performance.now() - this.executionPerformance.startedExecutionAt);
    this.emitExecutionPerformanceChange();
    clearInterval(this.executionTimeInterval);
  }

  public readonly RequirementStatus = RequirementStatus;
  public readonly AvailabilityStatusEnum = AvailabilityStatusEnum;
}
