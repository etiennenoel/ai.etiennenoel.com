import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { TaskStatus } from '../../enums/task-status.enum';
import { BaseComponent } from '../../components/base/base.component'; // Assuming a base component exists
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-summarizer-batch-page',
  templateUrl: './summarizer-batch-page.component.html',
  styleUrls: ['./summarizer-batch-page.component.scss'],
  standalone: false, // Explicitly set standalone to false
})
export class SummarizerBatchPageComponent extends BaseComponent implements OnInit {
  batchForm: FormGroup;
  public TaskStatus = TaskStatus;

  constructor(
    @Inject(DOCUMENT) document: Document,
    @Inject(PLATFORM_ID) private platformId: Object,
    protected readonly router: Router,
    protected readonly route: ActivatedRoute,
    protected readonly title: Title,
    private fb: FormBuilder
  ) {
    super(document);
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
}
