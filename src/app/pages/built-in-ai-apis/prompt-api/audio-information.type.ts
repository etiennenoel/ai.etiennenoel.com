import {MediaInformationInterface} from './media-information.interface';

export type AudioInformationType = MediaInformationInterface & {
  type: "audio";

  audioBuffer?: AudioBuffer;

  duration: string;

  channels: string;

  mimeType: string;
}
