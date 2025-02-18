import {Inject, Injectable, PLATFORM_ID} from '@angular/core';
import {AnalyticsSessionModel} from '../models/analytics-session.model';
import {ApiEnum} from '../enums/api.enum';
import {DOCUMENT, isPlatformServer} from '@angular/common';

@Injectable()
export class AnonymousAnalyticsManager {
  public shareAnonymousAnalyticsData?: boolean;

  constructor(
    @Inject(DOCUMENT) private readonly document: Document,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    this.loadShareAnonymousAnalyticsDataState();
  }

  get hasAskedToShareAnonymousAnalyticsData() {
    console.log(this.shareAnonymousAnalyticsData);
    return this.shareAnonymousAnalyticsData !== undefined;
  }

  updateShareAnonymousAnalyticsData(shareAnonymousAnalyticsData: boolean) {
    this.shareAnonymousAnalyticsData = shareAnonymousAnalyticsData;

    window.localStorage.setItem("shareAnonymousAnalyticsData", shareAnonymousAnalyticsData ? "true": "false");

    // todo: Trigger an upload of all the previously saved analytics data.
  }

  loadShareAnonymousAnalyticsDataState() {
    // Check to see if we have asked to share anonymous analytics data
    const window = this.document?.defaultView;

    if(isPlatformServer(this.platformId) || !window) {
      return;
    }

    if (this.shareAnonymousAnalyticsData === undefined) {
      // Load from localstorage
      const shareAnonymousAnalyticsData = window.localStorage.getItem("shareAnonymousAnalyticsData")

      if(shareAnonymousAnalyticsData === null) {
        return;
      }

      this.shareAnonymousAnalyticsData = shareAnonymousAnalyticsData === "false";
    }
  }

  public async save(analyticsSession: AnalyticsSessionModel): Promise<void> {
    this.loadShareAnonymousAnalyticsDataState();

    // Don't save anything if the user hasn't consented to sharing anonymous analytics data.
    if (!this.shareAnonymousAnalyticsData) {
      return;
    }

    try {
      // todo: Send data to server

      analyticsSession.sentToServer = true;
    } catch (e) {

      // If this couldn't be saved, save it locally.
      analyticsSession.sentToServer = false;
    }

    const cache = await caches.open("anonymous_analytics_data")
    const response = Response.json(analyticsSession);

    await cache.put(analyticsSession.id, response);
  }
}
