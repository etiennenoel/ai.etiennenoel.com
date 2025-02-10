import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {TaskStatus} from '../../enums/task-status.enum';
import {ExecutionPerformanceResultInterface} from '../../interfaces/execution-performance-result.interface';
import {ToastStore} from '../../stores/toast.store';

@Component({
  selector: 'app-output',
  templateUrl: './output.component.html',
  standalone: false,
  styleUrl: './output.component.scss'
})
export class OutputComponent {

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

  constructor(private readonly toastStore: ToastStore,) {
  }

  copyToClipboard(chunk: string) {
    navigator.clipboard.writeText(chunk)
    this.toastStore.publish({
      message: "Copied to clipboard",
    })
  }

  protected readonly TaskStatus = TaskStatus;
}
