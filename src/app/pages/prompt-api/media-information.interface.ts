export interface MediaInformationInterface {
  type: "audio" | "image";

  blob: Blob;

  title: string;

  includeInPrompt: boolean;

  fileSystemFileHandle?: FileSystemFileHandle;
}
