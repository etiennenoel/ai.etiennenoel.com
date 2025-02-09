import {RequirementStatus} from '../enums/requirement-status.enum';

export interface RequirementInterface {
  status: RequirementStatus;

  message: string;

  contentHtml: string;
}
