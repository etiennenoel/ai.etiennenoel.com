import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Subject } from 'rxjs';

import { BaseComponent } from './base.component';
import { RequirementInterface } from '../../interfaces/requirement.interface';
import { TaskStatus } from '../../enums/task-status.enum';

@Injectable()
export abstract class BasePageComponent extends BaseComponent implements OnInit, OnDestroy {
  // Common properties
  public apiFlag!: RequirementInterface; // TODO: check if this can be abstract or needs initialization
  public error!: Error; // TODO: check if this can be abstract or needs initialization
  public outputCollapsed = false;
  public output = '';
  public status: TaskStatus = TaskStatus.Initial;
  public loaded = 0;
  public abortController = new AbortController();
  public abortControllerFromCreate = new AbortController();

  protected readonly destroy$ = new Subject<void>();

  constructor(
    @Inject(PLATFORM_ID) protected platformId: object,
    @Inject(DOCUMENT) protected document: Document,
    protected router: Router,
    protected route: ActivatedRoute,
    protected titleService: Title,
  ) {
    super();
  }

  ngOnInit(): void {
    // Default ngOnInit implementation.
    // Concrete classes can override this if needed.
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    // Abort any ongoing operations
    this.abortController.abort();
    this.abortControllerFromCreate.abort();
  }

  // Abstract methods to be implemented by concrete classes
  abstract checkRequirements(): void;
  abstract checkAvailability(): void;

  // Common methods
  public abortTriggered(): void {
    this.abortController.abort();
    this.status = TaskStatus.Aborted;
    // TODO: Add any additional logic for aborting (e.g., resetting state)
  }

  public abortFromCreateTriggered(): void {
    this.abortControllerFromCreate.abort();
    // TODO: Add any additional logic for aborting from create (e.g., resetting state)
  }
}
