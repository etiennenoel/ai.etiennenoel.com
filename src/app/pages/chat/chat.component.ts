import {Component, Inject, OnDestroy, OnInit, PLATFORM_ID} from '@angular/core';
import {BasePageComponent} from '../../components/base/base-page.component';
import {ActivatedRoute, Router} from '@angular/router';
import {DOCUMENT} from '@angular/common';
import {Title} from '@angular/platform-browser';
import {ExecutionPerformanceManager} from '../../managers/execution-performance.manager';

@Component({
  selector: 'page-chat',
  templateUrl: './chat.component.html',
  standalone: false,
  styleUrl: './chat.component.scss'
})
export class ChatComponent extends BasePageComponent implements OnInit, OnDestroy {
  constructor(
    router: Router,
    route: ActivatedRoute,
    @Inject(DOCUMENT) document: Document,
    @Inject(PLATFORM_ID) private platformId: Object,
    title: Title,
    public readonly executionPerformanceManager: ExecutionPerformanceManager,
  ) {
    super(document, title)
  }

}
