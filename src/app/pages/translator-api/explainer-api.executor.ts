import {ApiExecutorInterface} from './interfaces/api-executor.interface';
import {RequirementInterface} from './interfaces/requirement.interface';
import {RequirementStatus} from '../../enums/requirement-status.enum';
import {isPlatformBrowser} from '@angular/common';
import {Inject, Injectable, PLATFORM_ID} from '@angular/core';
import {TaskStatus} from '../../enums/task-status.enum';
import {Step0} from './interfaces/step-0.interface';

@Injectable()
export class ExplainerApiExecutor implements ApiExecutorInterface {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
  }

  checkRequirements(): RequirementInterface {
    let translationApiStatus: RequirementStatus;
    let translationApiMessage: string;

    // Check if the translation API flag is enabled
    if (isPlatformBrowser(this.platformId) && !("ai" in window)) {
      translationApiStatus = RequirementStatus.Fail;
      translationApiMessage = "'window.ai' is not defined. Activate the flag.";
    }
    // @ts-ignore
    else if (isPlatformBrowser(this.platformId) && !("translator" in window.ai)) {
      translationApiStatus = RequirementStatus.Fail;
      translationApiMessage = "'window.ai.translator' is not defined. Activate the flag.";
    } else {
      translationApiStatus = RequirementStatus.Pass;
      translationApiMessage = "Passed";
    }

    return {
      translationApiFlag: {
        status: translationApiStatus,
        message: translationApiMessage,
        contentHtml: "Activate <span class=\"code\">chrome://flags/#translation-api</span>",
      }
    }
  }

  async executeStep0(sourceLanguage: string, targetLanguage: string): Promise<Step0> {
    try {
      // @ts-ignore
      const translatorCapabilities = await window.ai.translator.capabilities();

      const availability = translatorCapabilities.languagePairAvailable(sourceLanguage, targetLanguage);

      return {
        log: `Result of availability: '${availability}'.`,
        status: TaskStatus.Completed,
        available: availability,
        outputCollapsed: false,
      }
    } catch (e: any) {
      return {
        log: `Error: ${e.message}`,
        status: TaskStatus.Error,
        available: "error",
        outputCollapsed: false,
      }
    }
  }

  getStep0Code(sourceLanguage: string | null, targetLanguage?: string | null): string {
    return "const translatorCapabilities = await window.ai.translator.capabilities();\n" +
      "const availability = translatorCapabilities.languagePairAvailable(sourceLanguage, targetLanguage);\n" +
      "console.log(Result of availability: '${availability}'.);";
  }

  executeStep1(sourceLanguage: string, targetLanguage: string, callback?: (progress: {
    bytesDownloaded: number,
    totalBytes: number
  }) => void): Promise<{ log: string; status: TaskStatus }> {
    return new Promise<{ log: string; status: TaskStatus }>(async (resolve) => {
      try {
        // @ts-ignore
        const translator = await ai.translator.create({
          sourceLanguage: sourceLanguage,
          targetLanguage: targetLanguage,
          monitor(m: any) {
            m.addEventListener("downloadprogress", (e: any) => {
              callback?.({
                bytesDownloaded: e.loaded,
                totalBytes: e.total,
              });
            });
          },
        });

        return resolve({
          log: "Translator created.",
          status: TaskStatus.Completed,
        })
      } catch (e: any) {
        return resolve({
          log: `Error: ${e.message}`,
          status: TaskStatus.Error,
        })
      }
    });

  }

  getStep1Code(sourceLanguage: string | null, targetLanguage: string | null): string {
    return "const translator = await ai.translator.create({\n" +
      "    sourceLanguage: \"" + sourceLanguage + "\",\n" +
      "    targetLanguage: \"" + targetLanguage + "\",\n" +
      "    monitor(m) {\n" +
      "        m.addEventListener(\"downloadprogress\", e => {\n" +
      "            console.log(`Downloaded ${e.loaded} of ${e.total} bytes.`);\n" +
      "        });\n" +
      "    },\n" +
      "});";
  }

  async executeStep2(sourceLanguage: string, targetLanguage: string, content: string): Promise<{
    log: string;
    translatedContent: string,
    status: TaskStatus
  }> {
    try {
      // @ts-ignore
      const translator = await ai.translator.create({
        sourceLanguage: sourceLanguage,
        targetLanguage: targetLanguage,
      });

      const translatedContent = await translator.translate(content);

      return {
        log: `Translated content: ${translatedContent}`,
        translatedContent: translatedContent,
        status: TaskStatus.Completed,
      };
    } catch (e: any) {
      return {
        log: `Error: ${e.message}`,
        translatedContent: "",
        status: TaskStatus.Error,
      }
    }
  }

  getStep2Code(sourceLanguage: string | null, targetLanguage: string | null, content: string | null): string {
    return "const translatedContent = await translator.translate('" + content + "');\n" +
      "console.log(`Translated content: '${translatedContent}'.`);";
  }
}
