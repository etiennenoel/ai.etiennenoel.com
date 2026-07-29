import {Component, DOCUMENT, Inject, OnInit, PLATFORM_ID} from '@angular/core';
import {isPlatformBrowser} from '@angular/common';
import {FormControl} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {Title} from '@angular/platform-browser';

import {BaseBuiltInApiPageComponent} from '../../../components/base/base-built-in-api-page.component';
import {AvailabilityStatusEnum} from '../../../enums/availability-status.enum';
import {BuiltInAiApiEnum} from '../../../enums/built-in-ai-api.enum';
import {RequirementStatus} from '../../../enums/requirement-status.enum';
import {SemanticEmbedderTaskTypeEnum} from '../../../enums/semantic-embedder-task-type.enum';
import {TaskStatus} from '../../../enums/task-status.enum';
import {RequirementInterface} from '../../../interfaces/requirement.interface';
import {ExecutionPerformanceManager} from '../../../managers/execution-performance.manager';
import {EmbedderMetadataInterface} from './interfaces/embedder-metadata.interface';
import {EmbedderResultInterface} from './interfaces/embedder-result.interface';
import {EmbeddingRowInterface} from './interfaces/embedding-row.interface';

@Component({
  selector: 'app-semantic-embedder-api',
  templateUrl: './semantic-embedder-api.component.html',
  standalone: false,
  styleUrl: './semantic-embedder-api.component.scss'
})
export class SemanticEmbedderApiComponent extends BaseBuiltInApiPageComponent implements OnInit {

  public apiFlag: RequirementInterface = {
    status: RequirementStatus.Pending,
    message: 'Pending',
    contentHtml: `Activate <span class="code">chrome://flags/#semantic-embedder-api</span>`,
  }

  embedStatus = TaskStatus.Idle;

  availabilityTaskStatus = TaskStatus.Idle;

  /**
   * One passage per line. The API does not chunk large inputs, so the developer is the one
   * splitting the document into passages.
   */
  inputFormControl = new FormControl<string>(`The quick brown fox jumps over the lazy dog.
A fast, dark-colored fox leaps over a resting hound.
Built-in AI APIs use on-device models.`);

  taskTypeFormControl = new FormControl<SemanticEmbedderTaskTypeEnum | null>(null);

  rows: EmbeddingRowInterface[] = [];

  metadata?: EmbedderMetadataInterface;

  /**
   * Cosine similarity of every embedding against every other embedding.
   */
  similarityMatrix: number[][] = [];

  /**
   * Number of values of each vector displayed in the preview column.
   */
  previewLength = 8;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(DOCUMENT) document: Document,
    route: ActivatedRoute,
    router: Router,
    title: Title,
    public readonly executionPerformanceManager: ExecutionPerformanceManager,
  ) {
    super(document, title, router, route);
  }

  override ngOnInit() {
    super.ngOnInit();

    this.setTitle('Semantic Embedder API | AI Playground');

    this.checkRequirements();
    this.executionPerformanceManager.reset();

    this.subscriptions.push(this.route.queryParams.subscribe((params) => {
      if (params['input']) {
        this.inputFormControl.setValue(params['input'], {emitEvent: false});
      }

      if (params['taskType']) {
        this.taskTypeFormControl.setValue(params['taskType'], {emitEvent: false});
      }
    }));

    this.subscriptions.push(this.inputFormControl.valueChanges.subscribe((value) => {
      this.router.navigate(['.'], {
        relativeTo: this.route,
        queryParams: {input: value},
        queryParamsHandling: 'merge'
      });
    }));

    this.subscriptions.push(this.taskTypeFormControl.valueChanges.subscribe((value) => {
      this.router.navigate(['.'], {
        relativeTo: this.route,
        queryParams: {taskType: value},
        queryParamsHandling: 'merge'
      });
    }));
  }

  checkRequirements() {
    if (isPlatformBrowser(this.platformId) && (!this.window || !("SemanticEmbedder" in this.window))) {
      this.apiFlag.status = RequirementStatus.Fail;
      this.apiFlag.message = "'SemanticEmbedder' is not defined. Activate the flag.";
    } else if (isPlatformBrowser(this.platformId)) {
      this.apiFlag.status = RequirementStatus.Pass;
      this.apiFlag.message = "Passed";
    }
  }

  getRequirements(): RequirementInterface[] {
    return [this.apiFlag];
  }

  /**
   * Splits the textarea into the array of passages passed to `embed()`. Empty lines are dropped.
   */
  getInputs(): string[] {
    return (this.inputFormControl.value ?? "")
      .split("\n")
      .map(line => line.trim())
      .filter(line => line.length > 0);
  }

  get availabilityCode(): string {
    return `const availability = await SemanticEmbedder.availability();`;
  }

  async checkAvailability() {
    try {
      this.availabilityTaskStatus = TaskStatus.Executing;
      this.availabilityError = undefined;

      // @ts-expect-error SemanticEmbedder is not yet part of the TypeScript DOM lib.
      this.availabilityStatus = await SemanticEmbedder.availability();

      this.availabilityTaskStatus = TaskStatus.Completed;
    } catch (e: unknown) {
      this.availabilityError = e as Error;
      this.availabilityStatus = AvailabilityStatusEnum.Unavailable;
      this.availabilityTaskStatus = TaskStatus.Error;
    }
  }

  get embedCode(): string {
    const inputs = this.getInputs();
    const taskType = this.taskTypeFormControl.value;

    return `const abortController = new AbortController();

const semanticEmbedder = await SemanticEmbedder.create({
  monitor(m) {
    m.addEventListener("downloadprogress", (e) => {
      console.log(\`Downloaded \${e.loaded * 100}%\`);
    });
  },
  signal: abortController.signal,
});

// The API does not chunk large inputs: pass an array of pre-chunked passages instead.
const result = await semanticEmbedder.embed(${JSON.stringify(inputs, null, 2)}${taskType ? `, {
  taskType: ${JSON.stringify(taskType)},
}` : ``});

// result.embeddings[i].values is a Float32Array matching inputs[i].
const vectors = result.embeddings.map(embedding => embedding.values);

// Release the model as soon as you are done with it.
semanticEmbedder.destroy();`;
  }

  async embed() {
    const inputs = this.getInputs();

    if (inputs.length === 0) {
      return;
    }

    this.outputCollapsed = false;
    this.embedStatus = TaskStatus.Executing;
    this.error = undefined;
    this.rows = [];
    this.similarityMatrix = [];
    this.metadata = undefined;

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;

    let semanticEmbedder: {
      embed: (input: string | string[], options?: object) => Promise<EmbedderResultInterface>,
      destroy: () => void,
    } | undefined;

    try {
      this.abortControllerFromCreate = new AbortController();
      this.abortController = new AbortController();

      this.executionPerformanceManager.start(BuiltInAiApiEnum.SemanticEmbedder);
      this.executionPerformanceManager.sessionCreationStarted();

      // @ts-expect-error SemanticEmbedder is not yet part of the TypeScript DOM lib.
      semanticEmbedder = await SemanticEmbedder.create({
        monitor(m: EventTarget) {
          m.addEventListener("downloadprogress", (e: Event) => {
            self.loaded = (e as Event & { loaded: number }).loaded;
            self.executionPerformanceManager.downloadUpdated(self.loaded);
          });
        },
        signal: this.abortControllerFromCreate.signal,
      });
      this.executionPerformanceManager.sessionCreationCompleted();

      this.executionPerformanceManager.inferenceStarted({input: inputs.join("\n")});

      const taskType = this.taskTypeFormControl.value;
      const result = await semanticEmbedder!.embed(inputs, {
        ...(taskType ? {taskType} : {}),
        signal: this.abortController.signal,
      });
      this.executionPerformanceManager.tokenReceived();

      this.metadata = result.metadata;
      this.rows = result.embeddings.map((embedding, index) => ({
        index,
        input: inputs[index],
        dimensions: embedding.values.length,
        tokenCount: embedding.statistics?.tokenCount,
        truncated: embedding.statistics?.truncated,
        values: Array.from(embedding.values),
      }));

      this.similarityMatrix = this.computeSimilarityMatrix(this.rows);

      this.output = `${this.rows.length} embedding(s) of ${this.rows[0]?.dimensions ?? 0} dimensions generated.`;

      this.embedStatus = TaskStatus.Completed;
    } catch (e: unknown) {
      this.error = e as Error;
      this.embedStatus = TaskStatus.Error;
      this.executionPerformanceManager.sessionCreationCompleted();
    } finally {
      this.executionPerformanceManager.inferenceCompleted();

      // The embedder holds on to the model: release it proactively.
      semanticEmbedder?.destroy();
    }
  }

  computeSimilarityMatrix(rows: EmbeddingRowInterface[]): number[][] {
    return rows.map(rowA => rows.map(rowB => this.computeCosineSimilarity(rowA.values, rowB.values)));
  }

  computeCosineSimilarity(vectorA: number[], vectorB: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vectorA.length; i++) {
      dotProduct += vectorA[i] * vectorB[i];
      normA += vectorA[i] * vectorA[i];
      normB += vectorB[i] * vectorB[i];
    }

    const denominator = Math.sqrt(normA) * Math.sqrt(normB);

    return denominator === 0 ? 0 : dotProduct / denominator;
  }

  getPreview(row: EmbeddingRowInterface): string {
    const preview = row.values.slice(0, this.previewLength).map(value => value.toFixed(4)).join(", ");

    return `[${preview}${row.values.length > this.previewLength ? ", …" : ""}]`;
  }

  abortTriggered() {
    console.log(`abortTriggered`);
    this.abortController?.abort();
  }

  abortFromCreateTriggered() {
    console.log(`abortFromCreateTriggered`);
    this.abortControllerFromCreate?.abort();
  }

  protected readonly SemanticEmbedderTaskTypeEnum = SemanticEmbedderTaskTypeEnum;
}
