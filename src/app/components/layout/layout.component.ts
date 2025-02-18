import {Component, Inject, Input, OnInit, PLATFORM_ID} from '@angular/core';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {AnonymousAnalyticsManager} from '../../managers/anonymous-analytics.manager';
import {AnonymousAnalyticsOverlayComponent} from '../anonymous-analytics-overlay/anonymous-analytics-overlay.component';
import {isPlatformServer} from '@angular/common';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  standalone: false,
  styleUrl: './layout.component.scss'
})
export class LayoutComponent implements OnInit {
  constructor(
    public modalService: NgbModal,
    private readonly anonymousAnalyticsManager: AnonymousAnalyticsManager,
    @Inject(PLATFORM_ID) private platformId: Object,
    ) {
  }

  ngOnInit() {
    if(isPlatformServer(this.platformId) ||
      this.anonymousAnalyticsManager.hasAskedToShareAnonymousAnalyticsData) {
      return;
    }

    this.modalService.open(AnonymousAnalyticsOverlayComponent, {
      size: "lg"
    });
  }
}
