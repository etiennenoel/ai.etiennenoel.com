import {Component, Inject, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {DOCUMENT} from '@angular/common';
import {Title} from '@angular/platform-browser';
import {BasePageComponent} from '../../components/base/base-page.component';
import {TaskStatus} from '../../enums/task-status.enum';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  standalone: false,
  styleUrl: './index.component.scss'
})
export class IndexComponent extends BasePageComponent implements OnInit {

  downloadProgress: number = 0;

  downloadStatus: TaskStatus = TaskStatus.Idle;

  error: any;

  constructor(
    @Inject(DOCUMENT) document: Document,
    protected readonly route: ActivatedRoute,
    protected readonly router: Router,
    title: Title,
  ) {
    super(document, title);
  }

  override ngOnInit() {
    super.ngOnInit();

    this.setTitle("API Playground")
  }

  async download() {
    const self = this;
    try {
      this.downloadStatus = TaskStatus.Executing;
      // @ts-expect-error
      const session = await LanguageModel.create({
        monitor(m: any) {
          m.addEventListener("downloadprogress", (e: any) => {
            console.log(`Downloaded ${e.loaded * 100}%`);
            self.downloadProgress = e.loaded;
          });
        },
      });

      this.downloadStatus = TaskStatus.Completed;
    } catch (e) {
      this.downloadStatus = TaskStatus.Error;
      this.error = e;
    }

  }

  cancelDownload() {}

  getDownloadProgress() {
    return Math.floor(this.downloadProgress * 100);
  }
}
