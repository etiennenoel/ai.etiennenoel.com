import {TaskStatus} from '../../../../enums/task-status.enum';

export interface Step2 {
  status: TaskStatus,
  sourceLanguage: string;
  targetLanguage: string;
  content: string;
  translatedContent: string;
  outputCollapsed: boolean
  log: string;
}
