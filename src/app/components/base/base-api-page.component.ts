import {Directive, EventEmitter, Inject, Output} from '@angular/core';
import {BasePageComponent} from './base-page.component';
import {RequirementInterface} from '../../interfaces/requirement.interface';
import {DOCUMENT, isPlatformBrowser} from '@angular/common';
import {ActivatedRoute, Router} from '@angular/router';
import {Title} from '@angular/platform-browser';
import {TaskStatus} from '../../enums/task-status.enum';
import {AvailabilityStatusEnum} from '../../enums/availability-status.enum';
import {RequirementStatus} from '../../enums/requirement-status.enum';
import {PLATFORM_ID} from '@angular/core'; // Ensure PLATFORM_ID is imported

@Directive()
export abstract class BaseApiPageComponent extends BasePageComponent {
  // Abstract properties to be defined by concrete classes
  abstract apiName: string;
  abstract apiFlagName: string; // e.g., chrome://flags/#feature-name

  public apiFlag!: RequirementInterface; // Initialized by checkRequirements

  // Abstract getters for code display
  abstract get checkAvailabilityCode(): string;
  abstract get executeCode(): string;

  // Common properties
  public error?: Error;
  public availabilityStatus: AvailabilityStatusEnum = AvailabilityStatusEnum.Unknown;
  public availabilityError?: Error;
  public outputCollapsed: boolean = true;
  private _output: string = "";
  @Output() outputChange = new EventEmitter<string>();

  public outputChunks: string[] = [];
  @Output() outputChunksChange = new EventEmitter<string[]>();

  private _status: TaskStatus = TaskStatus.Idle;
  @Output() statusChange = new EventEmitter<TaskStatus>();

  private _loaded: number = 0;
  @Output() loadedChange = new EventEmitter<number>();

  private _abortController: AbortController | null = null;
  @Output() abortControllerChange = new EventEmitter<AbortController | null>();

  private _abortControllerFromCreate: AbortController | null = null;
  @Output() abortControllerFromCreateChange = new EventEmitter<AbortController | null>();

  constructor(
    @Inject(DOCUMENT) document: Document,
    @Inject(PLATFORM_ID) platformId: Object, // Inject PLATFORM_ID here
    titleService: Title,
    protected readonly router: Router,
    protected readonly route: ActivatedRoute
  ) {
    super(document, platformId, titleService); // Pass platformId to BasePageComponent
  }

  override ngOnInit() {
    super.ngOnInit();
    // Initialize apiFlag here or ensure it's initialized before use
    this.apiFlag = {
        status: RequirementStatus.Pending,
        message: 'Pending',
        contentHtml: `Activate <span class="code">${this.apiFlagName}</span>`
    };
    this.checkRequirements();
  }

  // Concrete method for checking requirements
  public checkRequirements(): void {
    // Default contentHtml, can be overridden by child class if needed after super.ngOnInit()
    this.apiFlag = {
        status: RequirementStatus.Pending,
        message: 'Checking...',
        contentHtml: `Activate <span class="code">${this.apiFlagName}</span>`
    };

    if (isPlatformBrowser(this.platformId)) {
      if (!this.window || !(this.apiName in this.window)) {
        this.apiFlag.status = RequirementStatus.Fail;
        this.apiFlag.message = `'${this.apiName}' is not defined. Activate the flag: ${this.apiFlagName}`;
      } else {
        this.apiFlag.status = RequirementStatus.Pass;
        this.apiFlag.message = "Passed";
      }
    } else {
      this.apiFlag.status = RequirementStatus.Pending; // Or NotApplicable if running on server
      this.apiFlag.message = "Requirement check applicable in browser.";
    }
  }

  public getRequirement(): RequirementInterface {
    return this.apiFlag;
  }

  // Getters and setters for private properties to trigger change detection or emit events
  get output(): string {
    return this._output;
  }

  set output(value: string) {
    this._output = value;
    this.outputChange.emit(value);
  }

  get status(): TaskStatus {
    return this._status;
  }

  set status(value: TaskStatus) {
    this._status = value;
    this.statusChange.emit(value);
  }

  get loaded(): number {
    return this._loaded;
  }

  set loaded(value: number) {
    this._loaded = value;
    this.loadedChange.emit(value);
  }

  get abortController(): AbortController | null {
    return this._abortController;
  }

  set abortController(value: AbortController | null) {
    this._abortController = value;
    this.abortControllerChange.emit(value);
  }

  get abortControllerFromCreate(): AbortController | null {
    return this._abortControllerFromCreate;
  }

  set abortControllerFromCreate(value: AbortController | null) {
    this._abortControllerFromCreate = value;
    this.abortControllerFromCreateChange.emit(value);
  }

  // Concrete methods for abort controllers
  public abortTriggered(): void {
    console.log('abortTriggered called in BaseApiPageComponent');
    this.abortController?.abort();
  }

  public abortFromCreateTriggered(): void {
    console.log('abortFromCreateTriggered called in BaseApiPageComponent');
    this.abortControllerFromCreate?.abort();
  }

  // Abstract methods to be implemented by concrete classes
  abstract checkAvailability(): Promise<void>;
  abstract execute(): Promise<void>;
}
