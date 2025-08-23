import {Component, Inject, OnInit, PLATFORM_ID} from '@angular/core';
import {isPlatformServer} from '@angular/common';

@Component({
  selector: 'webai-studio-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {

  languageModelAvailability?: "unavailable" | "downloadable" | "downloading" | "available";

  progress: number = 0;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
  }

  async ngOnInit() {
    await this.checkAvailability()
  }

  async triggerDownload() {
    const self = this;

    // @ts-expect-error
    const session = await LanguageModel.create({
      expectedInputs: [
        { type: "text", languages: ["en"] },
        { type: "audio", languages: ["en"] },
        { type: "image", languages: ["en"] },
      ],
      monitor(m: any) {
        m.addEventListener("downloadprogress", (e: any) => {
          console.log(`Downloaded ${e.loaded * 100}%`);
          self.progress = e.loaded;

          self.checkAvailability();
        });
      },
    })

    await this.checkAvailability();
  }

  async checkAvailability() {
    if(isPlatformServer(this.platformId)) {
      return;
    }

    try {
      // @ts-expect-error
      this.languageModelAvailability = await LanguageModel.availability({
        expectedInputs: [
          { type: "text", languages: ["en"] },
          { type: "audio", languages: ["en"] },
          { type: "image", languages: ["en"] },
        ]
      });
    } catch (e) {
      this.languageModelAvailability = "unavailable";
    }
  }
}
