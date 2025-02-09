import {Component, Input} from '@angular/core';
import {RequirementStatus} from '../../enums/requirement-status.enum';

@Component({
  selector: 'app-requirement',
  templateUrl: './requirement.component.html',
  standalone: false,
  styleUrl: './requirement.component.scss'
})
export class RequirementComponent {
  @Input()
  status?: RequirementStatus;

  @Input()
  message?: string;
  protected readonly RequirementStatus = RequirementStatus;
}
