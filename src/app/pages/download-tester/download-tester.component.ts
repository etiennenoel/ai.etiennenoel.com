import {Component} from '@angular/core';
import {TaskStatus} from '../../enums/task-status.enum';

@Component({
  selector: 'app-download-tester',
  templateUrl: './download-tester.component.html',
  standalone: false,
  styleUrl: './download-tester.component.scss'
})
export class DownloadTesterComponent {
  downloadProgressSummarizer: number = 0;

  statusSummarizer: TaskStatus = TaskStatus.Idle;

  error?: string;

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
}
