import {Directive, Inject, OnDestroy, OnInit, PLATFORM_ID} from '@angular/core';
import {Subscription} from 'rxjs';
import {Environment} from '../../environments/environment';
import {EnvironmentNameEnum} from '../../enums/environment-name.enum';
import {Title} from '@angular/platform-browser';
import {BaseComponent} from './base.component';
import {DOCUMENT} from "@angular/common"; // Added DOCUMENT

@Directive()
export abstract class BasePageComponent extends BaseComponent implements OnInit, OnDestroy {
  constructor(
    @Inject(DOCUMENT) document: Document, // Keep DOCUMENT injection if needed directly here, or remove if only needed in BaseComponent
    @Inject(PLATFORM_ID) protected platformId: Object, // Add platformId injection
    protected readonly titleService: Title,
    ) {
    super(document, platformId); // Pass platformId to BaseComponent
  }

  // ... rest of the class
  // Ensure setTitle method is correctly implemented
  setTitle(title: string) {
    const baseTitle = " | ai.etiennenoel.com";
    let fullTitle = title + baseTitle;

    if(Environment.name === EnvironmentNameEnum.ChromeDev) {
      // For ChromeDev, use only the provided title, or adjust as needed
      fullTitle = title;
    } else if(Environment.name === EnvironmentNameEnum.Development) {
      fullTitle = "[DEV] " + title + baseTitle;
    }

    this.titleService.setTitle(fullTitle);
  }
}
