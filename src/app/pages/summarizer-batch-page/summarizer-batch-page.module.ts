import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SummarizerBatchPageComponent } from './summarizer-batch-page.component';
// import { PageTitleComponent } from '../../components/page-title/page-title.component'; // Removed
import { SharedModule } from '../../components/shared.module'; // Added SharedModule

@NgModule({
  declarations: [
    SummarizerBatchPageComponent,
    // PageTitleComponent might not need to be declared here if it's already part of a shared module imported in AppModule
    // However, if it's used specifically by this page and not globally available, it should be imported or declared.
    // For now, assuming PageTitleComponent is globally available or will be handled.
  ],
  imports: [
    CommonModule,
    // PageTitleComponent, // Removed
    SharedModule, // Added SharedModule
    // Add other necessary modules here, e.g., FormsModule, ReactiveFormsModule if needed later
  ],
  exports: [
    SummarizerBatchPageComponent,
  ],
})
export class SummarizerBatchPageModule {}
