import {Component, Inject, PLATFORM_ID} from '@angular/core';
import {LocaleInterface} from '../../interfaces/locale.interface';
import {LOCALES} from '../../constants/locales.constant';
import {LOCALES_MAP} from '../../constants/locales-map.constant';
import {isPlatformServer} from '@angular/common';

@Component({
  selector: 'lib-translation',
  standalone: false,
  templateUrl: './translation.page.html',
  styleUrl: './translation.page.scss'
})
export class TranslationPage {
  protected readonly locales = LOCALES;

  protected detectedLanguage?:LocaleInterface;

  protected sourceLocale?: LocaleInterface;

  protected destinationLocale?: LocaleInterface;

  protected recentSourceLocales: LocaleInterface[] = [
    LOCALES_MAP['fr'],
    LOCALES_MAP['en'],
  ];

  protected recentDestinationLocales: LocaleInterface[] = [
    LOCALES_MAP['es'],
    LOCALES_MAP['pt'],
  ];

  languagePacksDownload:{sourceLocale: LocaleInterface, destinationLocale: LocaleInterface, progress: number, status: 'downloading' | 'completed' | 'unavailable'}[] = [];

  // @ts-expect-error
  translator: Translator;

  constructor(@Inject(PLATFORM_ID) private readonly platformId: Object){
  }

  getDownloadStatus(): 'idle' | 'downloading' | 'completed' | 'unavailable' {
    if(this.languagePacksDownload.length === 0) {
      return 'idle';
    }

    if(this.languagePacksDownload.some(l => l.status === 'downloading')) {
      return 'downloading';
    }

    if(this.languagePacksDownload.some(l => l.status === 'unavailable')) {
      return 'unavailable';
    }


    return 'completed';
  }

  onDetectLanguageClick(): void {
    this.sourceLocale = undefined;
  }

  onRecentSourceLanguageClick(locale: LocaleInterface): void {
    this.sourceLocale = locale;

    this.setupTranslator();
  }

  onRecentDestinationLanguageClick(locale: LocaleInterface): void {
    this.destinationLocale = locale;

    this.setupTranslator();
  }

  onSourceLanguageSelect(locale: LocaleInterface): void {
    this.sourceLocale = locale;
    this.recentSourceLocales = [
      locale,
      ...this.recentSourceLocales.filter(l => l.code !== locale.code)
    ].slice(0, 3);

    this.setupTranslator();
  }

  onDestinationLanguageSelect(locale: LocaleInterface): void {
    this.destinationLocale = locale;
    this.recentDestinationLocales = [
      locale,
      ...this.recentDestinationLocales.filter(l => l.code !== locale.code)
    ].slice(0, 3);

    this.setupTranslator();
  }

  async setupTranslator() {
    if(
      isPlatformServer(this.platformId) ||
      !("Translator" in self) ||
      !this.sourceLocale ||
      !this.destinationLocale
    ) {
      return;
    }

    const languagePacksDownload: {
      sourceLocale: LocaleInterface;
      destinationLocale: LocaleInterface;
      progress: number;
      status: "downloading" | "completed" | "unavailable";
    } = {
      sourceLocale: this.sourceLocale!,
      destinationLocale: this.destinationLocale!,
      progress: 0,
      status: 'downloading'
    }

    this.languagePacksDownload.push(languagePacksDownload);

    try {
      // @ts-expect-error
      this.translator = await Translator.create({
        sourceLanguage: this.sourceLocale?.code,
        targetLanguage: this.destinationLocale?.code,
        monitor(m: any) {
          m.addEventListener("downloadprogress", (e: any) => {
            languagePacksDownload.progress = e.loaded;
          });
        },
      });

      languagePacksDownload.status = 'completed';
    } catch (e) {
      languagePacksDownload.status = 'unavailable';
    }

  }

}
