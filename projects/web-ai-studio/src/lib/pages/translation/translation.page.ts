import { Component } from '@angular/core';
import {LocaleInterface} from '../../interfaces/locale.interface';
import {LOCALES} from '../../constants/locales.constant';
import {LOCALES_MAP} from '../../constants/locales-map.constant';

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

  onDetectLanguageClick(): void {
    this.sourceLocale = undefined;
  }

  onRecentSourceLanguageClick(locale: LocaleInterface): void {
    this.sourceLocale = locale;
  }

  onRecentDestinationLanguageClick(locale: LocaleInterface): void {
    this.destinationLocale = locale;
  }

  onSourceLanguageSelect(locale: LocaleInterface): void {
    this.sourceLocale = locale;
    this.recentSourceLocales = [
      locale,
      ...this.recentSourceLocales.filter(l => l.code !== locale.code)
    ].slice(0, 3);
  }

  onDestinationLanguageSelect(locale: LocaleInterface): void {
    this.destinationLocale = locale;
    this.recentDestinationLocales = [
      locale,
      ...this.recentDestinationLocales.filter(l => l.code !== locale.code)
    ].slice(0, 3);
  }
}
