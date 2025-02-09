import {RequirementStatus} from '../enums/requirement-status.enum';

export interface RequirementStatusInterface {
  status: RequirementStatus;
  message: string;
}
