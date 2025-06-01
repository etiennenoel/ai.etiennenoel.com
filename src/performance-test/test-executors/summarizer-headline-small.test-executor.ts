import {Inject, Injectable, PLATFORM_ID} from '@angular/core';
import {isPlatformBrowser} from '@angular/common';
import {TestExecutorInterface} from '../interfaces/test-executor.interface';
import {PerformanceTestResultModel} from '../models/performance-test-result.model';
// Placeholder for Summarizer - actual implementation is expected on window
import {AISummarizerFactory, AISummarizerCreateOptions, AISummarizer} from '../../app/audio-processing-module/dom-chromium-ai';
import {SummarizerFormatEnum} from '../../app/enums/summarizer-format.enum';
import {SummarizerLengthEnum} from '../../app/enums/summarizer-length.enum';
import {SummarizerTypeEnum} from '../../app/enums/summarizer-type.enum';
import {InferencePerformanceManager} from '../managers/inference-performance.manager';
import {ExecutionEnum} from '../enums/execution.enum';
import {PerformanceTestSeriesConfig} from '../configs/performance-test-series.config';
import {PerformanceTestSeriesEnum} from '../enums/performance-test-series.enum';

// Assume Summarizer is available globally, matching how SummarizerApiComponent uses it.
// This allows type checking but relies on the execution environment.
declare var Summarizer: AISummarizerFactory;

@Injectable()
export class SummarizerHeadlineSmallTestExecutor implements TestExecutorInterface {
    series = PerformanceTestSeriesEnum.SummarizerHeadlineSmall;
    private isBrowser: boolean;

    testResult: PerformanceTestResultModel

    constructor(
        private readonly inferencePerformanceManager: InferencePerformanceManager,
        @Inject(PLATFORM_ID) private platformId: object,
    ) {
        this.isBrowser = isPlatformBrowser(this.platformId);
        this.testResult = new PerformanceTestResultModel(this.series);
    }

    async init(): Promise<PerformanceTestResultModel> {
      this.testResult = new PerformanceTestResultModel(this.series);

      return this.testResult;
    }

  async execute(): Promise<ExecutionEnum> {
    this.inferencePerformanceManager.start();
    const config = PerformanceTestSeriesConfig[this.series];

    try {
      this.inferencePerformanceManager.sessionCreationStarted();
      const summarizer = await Summarizer.create(config.creationOptions);
      this.inferencePerformanceManager.sessionCreationCompleted();

      this.inferencePerformanceManager.inferenceStarted();
      // Assuming input is part of executionOptions, adjust if necessary
      const stream = summarizer.summarizeStreaming(config.executionOptions.input);

      let output = "";
      for await (const chunk of stream) {
        this.inferencePerformanceManager.tokenReceived();
        output += chunk;
      }

      this.testResult.output = output;

      return ExecutionEnum.Success;
    } catch (e) {
      console.error(e);
      return ExecutionEnum.Error; // Changed from ExecutionEnum.Fail
    } finally {
      this.inferencePerformanceManager.inferenceCompleted();
    }
  }
}
