import {Component} from '@angular/core';
import {TaskStatus} from '../../enums/task-status.enum';
import {AvailabilityStatusEnum} from '../../enums/availability-status.enum';

@Component({
  selector: 'app-download-tester',
  templateUrl: './download-tester.page.html',
  standalone: false,
  styleUrl: './download-tester.page.scss'
})
export class DownloadTesterPage {
  downloadProgressSummarizer: number = 0;

  statusSummarizer: TaskStatus = TaskStatus.Idle;
  availabilityStatusSummarizer: AvailabilityStatusEnum = AvailabilityStatusEnum.Unknown;

  error?: string;

  async availabilitySummarizer() {
    this.error = undefined;
    const self = this;
    this.availabilityStatusSummarizer = AvailabilityStatusEnum.Unknown;

    try {
      // @ts-expect-error
      this.availabilityStatusSummarizer = await Summarizer.availability({
        type: "headline",
        format: "plain-text",
        length: "medium",
      })
    } catch (e: any) {
      this.error = e;
    }
  }

  async createSummarizer() {
    this.error = undefined;
    const self = this;
    this.statusSummarizer = TaskStatus.Executing;

    try {
      //  @ts-expect-error
      const summarizer = await Summarizer.create({
        type: "headline",
        format: "plain-text",
        length: "medium",
        monitor(m: any)  {
          m.addEventListener("downloadprogress", (e: any) => {
            console.log(`Downloaded ${e.loaded * 100}%`);
            self.downloadProgressSummarizer = e.loaded * 100;
          });
        },
      });

      this.statusSummarizer = TaskStatus.Completed;
    } catch (e: any) {
      this.error = e;
      this.statusSummarizer = TaskStatus.Error;
    }
  }


  protected readonly TaskStatus = TaskStatus;
  protected readonly AvailabilityStatusEnum = AvailabilityStatusEnum;
}
