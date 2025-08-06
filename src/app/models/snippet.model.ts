import { SnippetTypeEnum } from "../../../../../magieno/magieno/projects/magieno-angular/projects/code-editor/src/lib/enums/snippet-type.enum";

export class Snippet {
  id?: number;
  title: string;
  content: string;
  type: SnippetTypeEnum;
}
