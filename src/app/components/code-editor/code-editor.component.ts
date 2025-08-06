import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  Output,
  PLATFORM_ID,
  ViewChild
} from '@angular/core';
import {RouterOutlet} from "@angular/router";
import {TaskStatus} from '../../enums/task-status.enum';

import {isPlatformBrowser, isPlatformServer} from '@angular/common';
import {CodeEditorActionsCoordinator} from '@magieno/angular-code-editor';

@Component({
  selector: 'code-editor',
  templateUrl: './code-editor.component.html',
  standalone: false,
  styleUrl: './code-editor.component.scss'
})
export class CodeEditorComponent {
  @Input()
  code: string = "";

  @Output()
  codeChange: any = new EventEmitter<string>();

  @Input()
  readonly = false;

  @Input()
  height: string = "250px"

  coordinator = new CodeEditorActionsCoordinator();

  constructor(@Inject(PLATFORM_ID) private readonly platformId: Object) {
  }
}
