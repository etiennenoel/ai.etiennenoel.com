import {Directive, EventEmitter, OnDestroy, OnInit, Output} from '@angular/core';
import {BasePageComponent} from './base-page.component';
import {Title} from '@angular/platform-browser';
import {TaskStatus} from '../../enums/task-status.enum';
import {AvailabilityStatusEnum} from '../../enums/availability-status.enum';
import {LocaleEnum} from '../../enums/locale.enum';
import {RequirementStatus} from '../../enums/requirement-status.enum';
import {ActivatedRoute, Router} from '@angular/router';


@Directive()
export abstract class BaseBuiltInApiPageComponent extends BasePageComponent implements OnInit, OnDestroy {
  public error?: Error;

  public outputCollapsed = true;
  public statisticsCollapsed = true;

  public outputChunks: string[] = [];

  public availabilityError?: Error;

  public outputStatusMessage: string = "";

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

  constructor(
    document: Document,
    titleService: Title,
    protected readonly router: Router,
    public readonly route: ActivatedRoute,
  ) {
    super(document, titleService);
  }

  override ngOnInit() {
    super.ngOnInit();

    this.subscriptions.push(this.route.queryParams.subscribe((params) => {
      if (params['statisticsCollapsed']) {
        this.statisticsCollapsed = params['statisticsCollapsed'] === 'true';
      }
    }))
  }

  AvailabilityStatusEnum = AvailabilityStatusEnum;
  availabilityStatus: AvailabilityStatusEnum = AvailabilityStatusEnum.Unknown;
  LocaleEnum = LocaleEnum;
  RequirementStatus = RequirementStatus;

}
