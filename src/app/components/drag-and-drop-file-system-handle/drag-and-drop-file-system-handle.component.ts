import {Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges} from "@angular/core";
import {RouterOutlet} from "@angular/router";
import {ShowOpenFilePickerOptionsInterface} from './show-open-file-picker-options.interface';
import {Observable, Subject, Subscription} from 'rxjs';

@Component({
  selector: 'file-drag-and-drop-file-system-handle',
  templateUrl: './drag-and-drop-file-system-handle.component.html',
  styleUrl: './drag-and-drop-file-system-handle.component.scss',
  standalone: false,
})
export class DragAndDropFileSystemHandleComponent implements OnChanges, OnDestroy {
  hasEnteredDropZone = false;

  @Output()
  onDragEnter: EventEmitter<DragEvent> = new EventEmitter<DragEvent>();

  @Output()
  onDragLeave: EventEmitter<DragEvent> = new EventEmitter<DragEvent>();

  @Output()
  onDragOver: EventEmitter<DragEvent> = new EventEmitter<DragEvent>();

  @Output()
  onDrop: EventEmitter<DragEvent> = new EventEmitter<DragEvent>();

  @Output()
  onFileSystemHandlesDropped: EventEmitter<FileSystemHandle[]> = new EventEmitter<FileSystemHandle[]>();

  @Output()
  onFilesDropped: EventEmitter<File[]> = new EventEmitter<File[]>();

  @Output()
  onFileSystemEntriesDropped: EventEmitter<FileSystemEntry[]> = new EventEmitter<FileSystemEntry[]>();

  @Input()
  showOpenFilePickerOptions?: ShowOpenFilePickerOptionsInterface

  @Input()
  clickEvents?: Observable<void>;

  private subscriptions: Subscription[] = [];

  ngOnChanges(changes: SimpleChanges) {
    if(changes["clickEvents"] && this.clickEvents) {
      this.subscriptions.push(this.clickEvents.subscribe(() => this.openFilePicker()));
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  async onDropEvent(event: DragEvent) {
    if(!event.dataTransfer) {
      return;
    }

    if(event.dataTransfer.files) {
      const files: File[] = [];

      for (let i = 0; i < event.dataTransfer.files.length; i++) {
        const file: File = event.dataTransfer.files[i];
        files.push(file);
      }

      this.onFilesDropped.emit(files);
    }

    const supportsFileSystemAccessAPI =
      'getAsFileSystemHandle' in DataTransferItem.prototype;

    const supportsWebkitGetAsEntry =
      'webkitGetAsEntry' in DataTransferItem.prototype;

    if(event.dataTransfer.items) {
      // Retrieve the file system handles and push them back.
      let fileSystemHandleItems: Promise<any>[] = [];
      let fileSystemEntryItems: Promise<any>[] = [];

      if(supportsFileSystemAccessAPI) {
        // @ts-ignore
        fileSystemHandleItems = [...event.dataTransfer.items].map(item => item.getAsFileSystemHandle());
      }

      if(supportsWebkitGetAsEntry) {
        // @ts-ignore
        fileSystemEntryItems = [...event.dataTransfer.items].map(item => item.webkitGetAsEntry());
      }

      const fileSystemHandles = [];
      for await (const item of fileSystemHandleItems) {
        fileSystemHandles.push(item);
      }

      const fileSystemEntries = [];
      for await (const item of fileSystemEntryItems) {
        fileSystemEntries.push(item);
      }

      if(fileSystemEntries.length > 0) {
        this.onFileSystemEntriesDropped.emit(fileSystemEntries);
      }

      if(fileSystemHandles.length > 0) {
        this.onFileSystemHandlesDropped.emit(fileSystemHandles);
      }
    }
  }

  onDragEnterEvent(event: DragEvent) {
    this.hasEnteredDropZone = true;
    this.onDragEnter.emit(event);
  }

  onDragOverEvent(event: DragEvent) {
    this.onDragOver.emit(event);
  }

  onDragLeaveEvent(event: DragEvent) {
    this.hasEnteredDropZone = false;

    this.onDragLeave.emit(event);
  }

  async openFilePicker() {
    if("showOpenFilePicker" in window) {
      // @ts-ignore
      const fileSystemFileHandles = await window.showOpenFilePicker(this.showOpenFilePickerOptions);

      this.onFileSystemHandlesDropped.emit(fileSystemFileHandles);
    }
  }

  click() {
    this.openFilePicker();
  }
}
