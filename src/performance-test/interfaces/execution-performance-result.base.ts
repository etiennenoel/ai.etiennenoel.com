export class ExecutionPerformanceResultBase {
  sessionCreationStartedAt?: Date;
  sessionCreationEndedAt?: Date;

  sessionCreationStart: number = 0;
  sessionCreationDuration: number = 0;
  sessionCreationEnd: number = 0;

  inferenceStartedAt?: Date;
  inferenceEndedAt?: Date;

  inferenceStart: number = 0;
  inferenceDuration: number = 0;
  inferenceEnd: number = 0;

  downloadStartedAt?: Date;
  downloadEndedAt?: Date;

  downloadStart: number = 0;
  downloadDuration: number = 0;
  downloadEnd: number = 0;

  tokensReceived: number[] = [];
}
