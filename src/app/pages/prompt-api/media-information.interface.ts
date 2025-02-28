export interface MediaInformationInterface {
  type: "audio" | "image";

  content: Blob;

  title: string;

  includeInPrompt: boolean;

  fileSystemFileHandle?: FileSystemFileHandle;
}
