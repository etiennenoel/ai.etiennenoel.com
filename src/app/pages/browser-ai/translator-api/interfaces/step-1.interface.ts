import {TaskStatus} from '../../../../enums/task-status.enum';

export interface Step1 {
  status: TaskStatus,
  totalBytes: number;
  bytesDownloaded: number;
  outputCollapsed: boolean
  log: string;
}
