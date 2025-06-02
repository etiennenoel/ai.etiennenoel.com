import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  OnInit,
  Output,
  PLATFORM_ID, ViewChild,
  viewChild
} from '@angular/core';
import {TaskStatus} from '../../../enums/task-status.enum';
import {RequirementStatus} from '../../../enums/requirement-status.enum';
import {DOCUMENT, isPlatformBrowser} from '@angular/common';
import {FormControl} from '@angular/forms';
import {BaseWritingAssistanceApiComponent} from '../../../components/base-writing-assistance-api/base-writing-assistance-api.component';
import {TextUtils} from '../../../utils/text.utils';
import {AvailabilityStatusEnum} from '../../../enums/availability-status.enum';
import {SearchSelectDropdownOptionsInterface} from '../../../interfaces/search-select-dropdown-options.interface';
import {LocaleEnum} from '../../../enums/locale.enum';
import {RewriterLengthEnum} from '../../../enums/rewriter-length.enum';
import {RewriterFormatEnum} from '../../../enums/rewriter-format.enum';
import {RewriterToneEnum} from '../../../enums/rewriter-tone.enum';
import {ActivatedRoute, Router} from '@angular/router';
import {RequirementInterface} from '../../../interfaces/requirement.interface';
import {Title} from '@angular/platform-browser';
import {BasePageComponent} from '../../../components/base/base-page.component';
import {RequirementStatusInterface} from '../../../interfaces/requirement-status.interface';
import {debounce, filter, timer} from 'rxjs';
import {PerformanceResultManager} from '../../../managers/performance-result.manager';
import {ExecutionPerformanceResultModel} from '../../../models/execution-performance-result.model';
import {BuiltInAiApiEnum} from '../../../enums/built-in-ai-api.enum';


@Component({
  selector: 'app-performance-history',
  templateUrl: './performance-history.page.html',
  standalone: false,
  styleUrl: './performance-history.page.scss'
})
export class PerformanceHistoryPage extends BasePageComponent implements OnInit {

  results: ExecutionPerformanceResultModel[] = [];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(DOCUMENT) document: Document,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly performanceResultManager: PerformanceResultManager,
    title: Title,
  ) {
    super(document, title);
  }

  override ngOnInit() {
    super.ngOnInit();

    this.refresh();
  }

  async refresh() {
    this.results = await this.performanceResultManager.list()
  }

  async clearHistory() {
    await this.performanceResultManager.deleteAll();
    this.refresh();
  }

  protected readonly BuiltInAiApiEnum = BuiltInAiApiEnum;
}
