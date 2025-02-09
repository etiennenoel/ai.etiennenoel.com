import {RequirementStatus} from '../../../enums/requirement-status.enum';

export interface RequirementInterface {
  translationApiFlag: {
    status: RequirementStatus,
    message: string;
  }
}
