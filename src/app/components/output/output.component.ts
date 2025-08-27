import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter, Inject,
  Input,
  OnChanges, OnInit,
  Output,
  SimpleChanges,
  DOCUMENT
} from '@angular/core';
import {TaskStatus} from '../../enums/task-status.enum';
import {ToastStore} from '../../stores/toast.store';
import {ActivatedRoute, Router} from '@angular/router';
import {BaseComponent} from '../base/base.component';
import {ExecutionPerformanceManager} from '../../managers/execution-performance.manager';
import {ExecutionPerformanceResultModel} from '../../models/execution-performance-result.model';


@Component({
  selector: 'app-output',
  templateUrl: './output.component.html',
  standalone: false,
  styleUrl: './output.component.scss'
})
export class OutputComponent extends BaseComponent implements OnChanges, OnInit, AfterViewInit {

  @Input()
  status: TaskStatus = TaskStatus.Idle;

  @Input()
  outputCollapsed: boolean = true;

  @Input()
  statisticsCollapsed: boolean = true;

  @Input()
  downloadProgress: number = 0;

  @Input()
  output: string = "";

  @Input()
  outputChunks: string[] = [];

  @Input()
  error?: Error;

  @Output()
  abortExecution = new EventEmitter<void>();

  @Output()
  abortExecutionFromCreate = new EventEmitter<void>();

  showDownloadProgress: boolean = true;

  hasLoaded = false;

  executionPerformanceResult?: ExecutionPerformanceResultModel;

  constructor(
    @Inject(DOCUMENT) document: Document,
    private readonly toastStore: ToastStore,
    private elRef:ElementRef,
    private router: Router,
    private route: ActivatedRoute,
    private readonly executionPerformanceManager: ExecutionPerformanceManager,
    ) {
    super(document)
  }

  override ngOnInit() {
    super.ngOnInit();

    this.subscriptions.push(this.executionPerformanceManager.updateSubscribers.subscribe(value => {
      // Need to assign to ensure the internal changes are propagated to the child object and that Angular detects a change (Angular doesn't detect when a property is modified).
      this.executionPerformanceResult = Object.assign({}, value);
    }))
  }

  getDownloadProgress() {
    return Math.floor(this.downloadProgress * 100);
  }

  copyToClipboard(chunk: string) {
    navigator.clipboard.writeText(chunk)
    this.toastStore.publish({
      message: "Copied to clipboard",
    })
  }

  ngAfterViewInit() {
    this.hasLoaded = true;
  }

  ngOnChanges(changes: SimpleChanges) {
    if(this.hasLoaded && (changes["status"])) {
      // Scroll into view
      this.elRef.nativeElement.scrollIntoView({
        behavior: "smooth",
      });
    }
  }

  toggleStatisticsCollapse() {
    this.statisticsCollapsed = !this.statisticsCollapsed;
    this.router.navigate(['.'], { relativeTo: this.route, queryParams: { statisticsCollapsed: this.statisticsCollapsed}, queryParamsHandling: 'merge' });
  }

  abortExecutionHandler() {
    this.abortExecution.emit();
  }

  abortExecutionFromCreateHandler() {
    this.abortExecutionFromCreate.emit();
  }
}
