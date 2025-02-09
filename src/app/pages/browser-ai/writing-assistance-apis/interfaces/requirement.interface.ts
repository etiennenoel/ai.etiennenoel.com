import {RequirementStatus} from '../../../../enums/requirement-status.enum';

export interface RequirementInterface {
  writerApiFlag: {
    status: RequirementStatus,
    message: string;
  }
  rewriterApiFlag: {
    status: RequirementStatus,
    message: string;
  }
  summarizerApiFlag: {
    status: RequirementStatus,
    message: string;
  }
}
