export interface AudioSampleInterface {
  duration: string;

  title: string;

  speaker: "woman" | "man";

  filename: string;

  language: string;

  format: string;

  channels: "stereo" | "mono" | "unknown";
}
