import {Component, Input} from '@angular/core';
import {RouterOutlet} from "@angular/router";
import {TaskStatus} from '../../enums/task-status.enum';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  standalone: false,
  styleUrl: './card.component.scss'
})
export class CardComponent {
  @Input()
  status?: TaskStatus;

  protected readonly TaskStatus = TaskStatus;
}
