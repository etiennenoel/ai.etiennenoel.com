export interface MediaInformationInterface {
  type: "audio" | "image";

  content: Blob;

  audioBuffer?: AudioBuffer;

  filename: string;

  includeInPrompt: boolean;

  fileSystemFileHandle?: FileSystemFileHandle;
}
