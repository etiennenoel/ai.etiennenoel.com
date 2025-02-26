import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges
} from '@angular/core';
import {TaskStatus} from '../../enums/task-status.enum';
import {ExecutionPerformanceResultInterface} from '../../interfaces/execution-performance-result.interface';
import {ToastStore} from '../../stores/toast.store';

@Component({
  selector: 'app-output',
  templateUrl: './output.component.html',
  standalone: false,
  styleUrl: './output.component.scss'
})
export class OutputComponent implements OnChanges, AfterViewInit {

  @Input()
  status: TaskStatus = TaskStatus.Idle;

  @Input()
  outputCollapsed: boolean = true;

  @Input()
  executionPerformanceResult?: ExecutionPerformanceResultInterface;

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

  constructor(
    private readonly toastStore: ToastStore,
    private elRef:ElementRef
    ) {
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

  abortExecutionHandler() {
    this.abortExecution.emit();
  }

  abortExecutionFromCreateHandler() {
    this.abortExecutionFromCreate.emit();
  }

  protected readonly TaskStatus = TaskStatus;
}
