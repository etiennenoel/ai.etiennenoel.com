import {Component, EventEmitter, Inject, Input, OnInit, Output, PLATFORM_ID, DOCUMENT} from '@angular/core';

import {TaskStatus} from '../../enums/task-status.enum';
import {Title} from '@angular/platform-browser';
import {ActivatedRoute, Router} from '@angular/router';
import {FormArray, FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {SummarizerFormatEnum} from '../../enums/summarizer-format.enum';
import {SummarizerLengthEnum} from '../../enums/summarizer-length.enum';
import {SummarizerTypeEnum} from '../../enums/summarizer-type.enum';
import {
  BaseWritingAssistanceApiComponent
} from '../../components/base-writing-assistance-api/base-writing-assistance-api.component';

@Component({
  selector: 'app-summarizer-batch-page',
  templateUrl: './summarizer-batch-page.component.html',
  styleUrls: ['./summarizer-batch-page.component.scss'],
  standalone: false, // Explicitly set standalone to false
})
export class SummarizerBatchPageComponent extends BaseWritingAssistanceApiComponent implements OnInit {
  form: FormArray<FormGroup<{
    input: FormControl<string| null>,
    status: FormControl<TaskStatus | null>,
    output: FormControl<string | null>,
  }>>;

  // <editor-fold desc="Type">
  private _type: SummarizerTypeEnum | null = SummarizerTypeEnum.Headline;
  public typeFormControl: FormControl<SummarizerTypeEnum | null> = new FormControl<SummarizerTypeEnum | null>(SummarizerTypeEnum.Headline);

  get type(): SummarizerTypeEnum | null {
    return this._type;
  }

  @Input()
  set type(value: SummarizerTypeEnum | null) {
    this.setType(value);
  }

  setType(value: SummarizerTypeEnum | null, options?: {emitFormControlEvent?: boolean, emitChangeEvent?: boolean}) {
    this._type = value;
    this.typeFormControl.setValue(value, {emitEvent: options?.emitFormControlEvent ?? true});
    if(options?.emitChangeEvent ?? true) {
      this.typeChange.emit(value);
    }

    this.router.navigate(['.'], { relativeTo: this.route, queryParams: { summarizerType: value}, queryParamsHandling: 'merge' });
  }

  @Output()
  typeChange = new EventEmitter<SummarizerTypeEnum | null>();
  // </editor-fold>

  // <editor-fold desc="Format">
  private _format: SummarizerFormatEnum | null = SummarizerFormatEnum.PlainText;
  public formatFormControl: FormControl<SummarizerFormatEnum | null> = new FormControl<SummarizerFormatEnum | null>(SummarizerFormatEnum.PlainText);

  get format(): SummarizerFormatEnum | null {
    return this._format;
  }

  @Input()
  set format(value: SummarizerFormatEnum | null) {
    this.setFormat(value);
  }

  setFormat(value: SummarizerFormatEnum | null, options?: {emitFormControlEvent?: boolean, emitChangeEvent?: boolean}) {
    this._format = value;
    this.formatFormControl.setValue(value, {emitEvent: options?.emitFormControlEvent ?? true});
    if(options?.emitChangeEvent ?? true) {
      this.formatChange.emit(value);
    }

    this.router.navigate(['.'], { relativeTo: this.route, queryParams: { summarizerFormat: value}, queryParamsHandling: 'merge' });
  }

  @Output()
  formatChange = new EventEmitter<SummarizerFormatEnum | null>();
  // </editor-fold>

  // <editor-fold desc="Length">
  private _length: SummarizerLengthEnum | null = SummarizerLengthEnum.Medium;
  public lengthFormControl: FormControl<SummarizerLengthEnum | null> = new FormControl<SummarizerLengthEnum | null>(SummarizerLengthEnum.Medium);

  get length(): SummarizerLengthEnum | null {
    return this._length;
  }

  @Input()
  set length(value: SummarizerLengthEnum | null) {
    this.setLength(value);
  }

  setLength(value: SummarizerLengthEnum | null, options?: {emitFormControlEvent?: boolean, emitChangeEvent?: boolean}) {
    this._length = value;
    this.lengthFormControl.setValue(value, {emitEvent: options?.emitFormControlEvent ?? true});
    if(options?.emitChangeEvent ?? true) {
      this.lengthChange.emit(value);
    }

    this.router.navigate(['.'], { relativeTo: this.route, queryParams: { summarizerLength: value}, queryParamsHandling: 'merge' });
  }

  @Output()
  lengthChange = new EventEmitter<SummarizerLengthEnum | null>();
  // </editor-fold>

  constructor(
    @Inject(DOCUMENT) document: Document,
    @Inject(PLATFORM_ID) private platformId: Object,
    router: Router,
    route: ActivatedRoute,
    protected readonly title: Title,
    private fb: FormBuilder
  ) {
    super(document, router, route, title);

    this.form = new FormArray<FormGroup<{
      input: FormControl<string| null>,
      status: FormControl<TaskStatus | null>,
      output: FormControl<string | null>,
    }>>([]); // Initialize the FormArray
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.title.setTitle('Summarizer Batch Page');
    this.addInitialInput();
  }

  addInitialInput(): void {
    this.form.push(new FormGroup<{
      input: FormControl<string| null>,
      status: FormControl<TaskStatus | null>,
      output: FormControl<string | null>,
    }>({
      input: new FormControl(null),
      status: new FormControl(TaskStatus.Idle),
      output: new FormControl(null),
    }));
  }

  addRow(): void {
    this.form.push(new FormGroup<{
      input: FormControl<string| null>,
      status: FormControl<TaskStatus | null>,
      output: FormControl<string | null>,
    }>({
      input: new FormControl(null),
      status: new FormControl(TaskStatus.Idle),
      output: new FormControl(null),
    }));
  }

  deleteRow(index: number): void {
    const inputs = this.form.removeAt(index);
  }

  public onPaste(event: ClipboardEvent, rowIndex: number): void {
    event.preventDefault();
    const clipboardData = event.clipboardData;
    const htmlData = clipboardData?.getData('text/html');

    if (htmlData) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlData, 'text/html');
      const table = doc.querySelector('table');

      if (table) {
        const rows = Array.from(table.querySelectorAll('tr'));
        const lines: string[] = [];
        rows.forEach(row => {
          const firstCell = row.querySelector('td, th'); // Get first cell (td or th)
          if (firstCell) {
            lines.push(firstCell.textContent?.trim() || '');
          }
        });

        if (lines.length > 0) {
          // Set the first line to the text control of the current row's FormGroup
          this.form.at(rowIndex).controls.input.setValue(lines[0]);

          // For subsequent lines, insert new FormGroups
          for (let i = 1; i < lines.length; i++) {
            const newFormGroup = new FormGroup<{
              input: FormControl<string | null>,
              status: FormControl<TaskStatus | null>,
              output: FormControl<string | null>,
            }>({
              input: new FormControl(lines[i]),
              status: new FormControl(TaskStatus.Idle),
              output: new FormControl(null),
            });
            // Insert after the current rowIndex + number of lines already added
            this.form.insert(rowIndex + i, newFormGroup);
          }
        }
        return; // Exit after processing HTML table
      }
    }

    // Fallback to plain text pasting
    const pastedText = clipboardData?.getData('text');
    if (!pastedText) {
      return;
    }

    const lines = pastedText.split('\n').map(line => line.trim());

    if (lines.length > 0) {
      // Set the first line to the text control of the current row's FormGroup
      this.form.at(rowIndex).controls.input.setValue(lines[0]);

      // For subsequent lines, insert new FormGroups
      for (let i = 1; i < lines.length; i++) {
        const newFormGroup = new FormGroup<{
          input: FormControl<string| null>,
          status: FormControl<TaskStatus | null>,
          output: FormControl<string | null>,
        }>({
          input: new FormControl(lines[i]),
          status: new FormControl(TaskStatus.Idle),
          output: new FormControl(null),
        });
        // Insert after the current rowIndex + number of lines already added
        this.form.insert(rowIndex + i, newFormGroup);
      }
    }
  }

  copyOutputToClipboard(): void {
    const outputText = this.form.controls.map(control => control.controls.output.value?.replace(/\n/g, '')).join('\n');
    if (outputText) {
      navigator.clipboard.writeText(outputText).then(() => {
        console.log('Output copied to clipboard');
      }).catch(err => {
        console.error('Failed to copy output: ', err);
      });
    } else {
      console.warn('No output to copy');
    }
  }

  async summarizeBatch() {
    try {
      // @ts-expect-error
      const summarizer = await Summarizer.create({
        type: this.typeFormControl.value,
        format: this.formatFormControl.value,
        length: this.lengthFormControl.value,
        sharedContext: this.sharedContext,
        expectedInputLanguages: this.expectedInputLanguagesFormControl.value,
        expectedContextLanguages: this.expectedContextLanguagesFormControl.value,
        outputLanguage: this.outputLanguageFormControl.value,
      });

      for (const value of this.form.controls) {
        try {
          const input = value.controls.input.value;
          value.controls.status.setValue(TaskStatus.Executing);

          value.controls.output.setValue("");

          // Summarize this input.
          const stream: ReadableStream = summarizer.summarizeStreaming(input, {context: this.contextFormControl.value});

          for await (const chunk of stream) {
            // Append the chunk to the output control.
            const currentOutput = value.controls.output.value || '';
            value.controls.output.setValue(currentOutput + chunk);
          }

          value.controls.status.setValue(TaskStatus.Completed);
        } catch (e) {
          value.controls.status.setValue(TaskStatus.Error);
        }
      }
    } catch (e: any) {
      this.error = e;
    }
  }

  protected readonly SummarizerFormatEnum = SummarizerFormatEnum;
  protected readonly SummarizerLengthEnum = SummarizerLengthEnum;
  protected readonly SummarizerTypeEnum = SummarizerTypeEnum;
}
