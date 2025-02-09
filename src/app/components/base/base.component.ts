import {Component, Directive, Input, OnDestroy, OnInit} from '@angular/core';
import {RouterOutlet} from "@angular/router";
import {TaskStatus} from '../../enums/task-status.enum';
import {Subscription} from 'rxjs';

@Directive()
export abstract class BaseComponent implements OnInit, OnDestroy {
  protected subscriptions: Subscription[] = [];

  protected window: Window | null;

  constructor(protected readonly document: Document) {
    this.window = this.document?.defaultView;
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  public TaskStatus = TaskStatus;
}
