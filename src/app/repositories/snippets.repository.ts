import { Injectable } from '@angular/core';
import { Snippet } from '../../../../../magieno/magieno/projects/magieno-angular/projects/code-editor/src/lib/models/snippet.model';
import { SnippetTypeEnum } from '../../../../../magieno/magieno/projects/magieno-angular/projects/code-editor/src/lib/enums/snippet-type.enum';
import { IndexedDBService } from '../../../../../magieno/magieno/projects/magieno-angular/projects/code-editor/src/lib/services/indexed-db.service';

@Injectable({
  providedIn: 'root'
})
export class SnippetsRepository {
  private readonly dbName = 'magieno';
  private readonly storeName = 'snippets';

  constructor(private indexedDbService: IndexedDBService) {
    this.indexedDbService.openDb(this.dbName, this.storeName);
  }

  public add(snippet: Snippet): Promise<number> {
    return this.indexedDbService.add(this.storeName, snippet);
  }

  public get(id: number): Promise<Snippet> {
    return this.indexedDbService.get(this.storeName, id);
  }

  public getAll(): Promise<Snippet[]> {
    return this.indexedDbService.getAll(this.storeName);
  }

  public update(snippet: Snippet): Promise<void> {
    return this.indexedDbService.update(this.storeName, snippet);
  }

  public delete(id: number): Promise<void> {
    return this.indexedDbService.delete(this.storeName, id);
  }

  public listByType(type: SnippetTypeEnum): Promise<Snippet[]> {
    return new Promise((resolve, reject) => {
      this.indexedDbService.getAll<Snippet>(this.storeName).then(snippets => {
        resolve(snippets.filter(s => s.type === type));
      }).catch(reject);
    });
  }
}
