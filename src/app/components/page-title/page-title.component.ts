import {Component, Input} from '@angular/core';
import {RouterOutlet} from "@angular/router";
import {TaskStatus} from '../../enums/task-status.enum';

@Component({
  selector: 'app-page-title',
  templateUrl: './page-title.component.html',
  standalone: false,
  styleUrl: './page-title.component.scss'
})
export class PageTitleComponent {
  @Input()
  icon?: string;

  @Input()
  title?: string;

  protected readonly StepStatus = TaskStatus;
}
