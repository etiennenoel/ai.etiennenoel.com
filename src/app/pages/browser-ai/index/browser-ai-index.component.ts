import {Component, Inject, Input, OnInit} from '@angular/core';
import {ActivatedRoute, NavigationEnd, NavigationStart, Router, RouterOutlet} from "@angular/router";
import {BaseComponent} from '../../../components/base/base.component';
import {DOCUMENT} from '@angular/common';

@Component({
  selector: 'app-browser-ai-index',
  templateUrl: './browser-ai-index.component.html',
  standalone: false,
  styleUrl: './browser-ai-index.component.scss'
})
export class BrowserAIIndexComponent extends BaseComponent implements OnInit {

  public currentRoute?: 'translator-api' | 'language-detector-api' | 'writing-assistance-apis' | 'prompt-api';

  public expanded = true;

  constructor(
    @Inject(DOCUMENT) document: Document,
    protected readonly route: ActivatedRoute,
    protected readonly router: Router,
  ) {
    super(document);
  }

  override ngOnInit() {
    super.ngOnInit();

    this.setCurrentRoute(window.location.pathname);

    this.subscriptions.push(this.router.events.subscribe((event) => {
      if(event instanceof NavigationEnd) {
        this.setCurrentRoute(event.url);
      }
    }))

    this.subscriptions.push(this.route.queryParams.subscribe(params => {
      if(params['expanded'] === 'false') {
        this.expanded = false;
      } else if(params['expanded'] === 'true') {
        this.expanded = true;
      }
    }))
  }

  setCurrentRoute(url: string) {
    if(url.endsWith('translator-api')) {
      this.currentRoute = 'translator-api';
    } else if(url.endsWith('language-detector-api')) {
      this.currentRoute = 'language-detector-api';
    } else if(url.endsWith('writing-assistance-apis')) {
      this.currentRoute = 'writing-assistance-apis';
    } else if(url.endsWith('prompt-api')) {
      this.currentRoute = 'prompt-api';
    }
  }

  toggleSidebar() {
    this.expanded = !this.expanded;

    const urlTree = this.router.parseUrl(this.router.url)
    urlTree.queryParams['expanded'] = this.expanded;
    this.router.navigateByUrl(urlTree)
  }
}
