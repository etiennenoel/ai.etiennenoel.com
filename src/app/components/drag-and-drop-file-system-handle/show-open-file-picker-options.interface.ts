export interface ShowOpenFilePickerOptionsInterface {
  id?: string;

  startIn: FileSystemHandle | "desktop" | "documents" | "downloads" | "pictures" | "videos" | "music";

  multiple: boolean;

  excludeAcceptAllOption: boolean;

  types: {
    description: string;
    accept: { [id in string]: string[]},
  }[];
}
