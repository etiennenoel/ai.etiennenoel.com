import {TaskStatus} from '../../../enums/task-status.enum';

export interface Step0 {
  status: TaskStatus,
  available: string;
  outputCollapsed: boolean;
  log: string;
}
