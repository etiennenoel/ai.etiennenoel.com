import {Component, Inject, Input, OnInit} from '@angular/core';
import {RouterOutlet} from "@angular/router";
import {TaskStatus} from '../../enums/task-status.enum';
import {AnonymousAnalyticsManager} from '../../managers/anonymous-analytics.manager';
import {FormControl} from '@angular/forms';
import {BaseComponent} from '../base/base.component';
import {DOCUMENT} from '@angular/common';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-anonymous-analytics-overlay',
  templateUrl: './anonymous-analytics-overlay.component.html',
  standalone: false,
  styleUrl: './anonymous-analytics-overlay.component.scss'
})
export class AnonymousAnalyticsOverlayComponent extends BaseComponent {

  constructor(
    @Inject(DOCUMENT) document: Document,
    private readonly activeModal: NgbActiveModal,
    private readonly anonymousAnalyticsManager: AnonymousAnalyticsManager,
    ) {
    super(document);
  }

  consent() {
    this.anonymousAnalyticsManager.updateShareAnonymousAnalyticsData(true);

    this.activeModal.close();
  }

  doNotConsent() {
    this.anonymousAnalyticsManager.updateShareAnonymousAnalyticsData(false);

    this.activeModal.close();
  }

}
