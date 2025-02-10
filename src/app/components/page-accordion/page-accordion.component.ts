import {Component, EventEmitter, Input, Output} from '@angular/core';
import {TaskStatus} from '../../enums/task-status.enum';
import {RequirementStatus} from '../../enums/requirement-status.enum';
import {RequirementInterface} from '../../interfaces/requirement.interface';

@Component({
  selector: 'app-page-accordion',
  templateUrl: './page-accordion.component.html',
  standalone: false,
  styleUrl: './page-accordion.component.scss'
})
export class PageAccordionComponent {
  @Input()
  requirementsStatus: RequirementStatus = RequirementStatus.Pending;

  @Input()
  requirements: RequirementInterface[] = [];

  @Output()
  checkRequirementsEvent = new EventEmitter<void>();


  checkRequirements() {
    this.checkRequirementsEvent.emit();
  }

  protected readonly RequirementStatus = RequirementStatus;
  protected readonly TaskStatus = TaskStatus;
}
