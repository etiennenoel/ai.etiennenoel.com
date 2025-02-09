export interface MediaInformationInterface {
  type: "audio" | "image";

  content: Blob;

  filename: string;

  includeInPrompt: boolean;

  fileSystemFileHandle: FileSystemFileHandle;
}
