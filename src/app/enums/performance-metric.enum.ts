export enum PerformanceMetricEnum {
  SessionCreationStarted = 'SESSION_CREATION_STARTED',
  SessionCreationEnded = 'SESSION_CREATION_ENDED',
  SessionCreationDuration = 'SESSION_CREATION_DURATION',

  DownloadStarted = 'DOWNLOAD_STARTED',
  DownloadEnded = 'DOWNLOAD_ENDED',
  DownloadDuration = 'DOWNLOAD_DURATION',

  InferenceStarted = 'INFERENCE_STARTED',
  InferenceEnded = 'INFERENCE_ENDED',
  InferenceDuration = 'INFERENCE_DURATION',

  TokenReceived = 'TOKEN_RECEIVED',
}
