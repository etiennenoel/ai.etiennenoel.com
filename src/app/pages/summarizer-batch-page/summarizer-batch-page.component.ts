import {Component, OnInit, Inject, PLATFORM_ID, Input, Output, EventEmitter} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { TaskStatus } from '../../enums/task-status.enum';
import { BaseComponent } from '../../components/base/base.component'; // Assuming a base component exists
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, FormControl, ReactiveFormsModule } from '@angular/forms';
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
  batchForm: FormGroup;
  public StoredTaskStatus = TaskStatus;

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
    this.batchForm = this.fb.group({
      inputs: this.fb.array([]) // We will populate this in addInitialInput
    });
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.title.setTitle('Summarizer Batch Page');
    this.addInitialInput();
  }

  // get inputControls() {
  //   return (this.batchForm.get('inputs') as FormArray).controls;
  // }

  get rowControls() {
    return (this.batchForm.get('inputs') as FormArray).controls;
  }

  addInitialInput(): void {
    const inputs = this.batchForm.get('inputs') as FormArray;
    inputs.push(this.fb.group({
      text: this.fb.control(''),
      status: this.fb.control(TaskStatus.Idle)
    }));
  }

  addRow(): void {
    const inputs = this.batchForm.get('inputs') as FormArray;
    inputs.push(this.fb.group({
      text: this.fb.control(''),
      status: this.fb.control(TaskStatus.Idle)
    }));
  }

  deleteRow(index: number): void {
    const inputs = this.batchForm.get('inputs') as FormArray;
    inputs.removeAt(index);
  }

  public onPaste(event: ClipboardEvent, rowIndex: number): void {
    event.preventDefault();
    const pastedText = event.clipboardData?.getData('text');
    if (!pastedText) {
      return;
    }

    const lines = pastedText.split('\n').map(line => line.trim());
    const inputs = this.batchForm.get('inputs') as FormArray; // ensure 'inputs' is correctly typed

    if (lines.length > 0) {
      // Set the first line to the text control of the current row's FormGroup
      (inputs.at(rowIndex) as FormGroup).get('text')?.setValue(lines[0]);

      // For subsequent lines, insert new FormGroups
      for (let i = 1; i < lines.length; i++) {
        const newFormGroup = this.fb.group({
          text: this.fb.control(lines[i]),
          status: this.fb.control(TaskStatus.Idle)
        });
        // Insert after the current rowIndex + number of lines already added
        inputs.insert(rowIndex + i, newFormGroup);
      }
    }
  }

  public getTextControl(rowIndex: number): FormControl {
    const formGroup = this.rowControls[rowIndex] as FormGroup;
    return formGroup.get('text') as FormControl;
  }

  public getStatusValue(rowIndex: number): TaskStatus | undefined {
    const formGroup = this.rowControls[rowIndex] as FormGroup;
    return formGroup.get('status')?.value;
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
      

    } catch (e) {

    }
  }

  protected readonly SummarizerFormatEnum = SummarizerFormatEnum;
  protected readonly SummarizerLengthEnum = SummarizerLengthEnum;
  protected readonly SummarizerTypeEnum = SummarizerTypeEnum;
}
