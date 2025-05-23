import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  OnInit,
  Output,
  PLATFORM_ID, ViewChild,
  viewChild
} from '@angular/core';
import {TaskStatus} from '../../enums/task-status.enum';
import {RequirementStatus} from '../../enums/requirement-status.enum';
import {DOCUMENT, isPlatformBrowser} from '@angular/common';
import {FormControl} from '@angular/forms';
import {BaseWritingAssistanceApiComponent} from '../../components/base-writing-assistance-api/base-writing-assistance-api.component';
import {TextUtils} from '../../utils/text.utils';
import {AvailabilityStatusEnum} from '../../enums/availability-status.enum';
import {SearchSelectDropdownOptionsInterface} from '../../interfaces/search-select-dropdown-options.interface';
import {LocaleEnum} from '../../enums/locale.enum';
import {RewriterLengthEnum} from '../../enums/rewriter-length.enum';
import {RewriterFormatEnum} from '../../enums/rewriter-format.enum';
import {RewriterToneEnum} from '../../enums/rewriter-tone.enum';
import {ActivatedRoute, Router} from '@angular/router';
import {RequirementInterface} from '../../interfaces/requirement.interface';
import {Title} from '@angular/platform-browser';
import {BasePageComponent} from '../../components/base/base-page.component';
import {RequirementStatusInterface} from '../../interfaces/requirement-status.interface';
import {debounce, filter, timer} from 'rxjs';


@Component({
  selector: 'app-autocomplete',
  templateUrl: './autocomplete.component.html',
  standalone: false,
  styleUrl: './autocomplete.component.scss'
})
export class AutocompleteComponent extends BasePageComponent  implements OnInit, AfterViewInit {

  // Get from the angular html view
  @ViewChild("suggestionTextareaElement")
  suggestionTextareaElement!: ElementRef;

  @ViewChild("mainTextareaElement")
  mainTextareaElement!: ElementRef;


  get mainTextarea(): HTMLTextAreaElement {
    return this.mainTextareaElement.nativeElement as HTMLTextAreaElement;
  }

  get suggestionTextarea(): HTMLTextAreaElement {
    return this.suggestionTextareaElement.nativeElement as HTMLTextAreaElement;
  }

  mainTextAreaFormControl = new FormControl("");
  suggestionTextAreaFormControl = new FormControl("");

  activeSuggestionFullText?: string;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(DOCUMENT) document: Document,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    title: Title,
  ) {
    super(document, title);
  }

  override async ngOnInit() {
    super.ngOnInit();

    let session: any;

    if(this.window && "LanguageModel" in this.window) {
      // @ts-expect-error
      session = await LanguageModel.create({
        initialPrompts: [
          { role: "system", content: "You are an autocomplete agent. You will autocomplete a MAXIMUM of two sentences and only return the following sentences." }
        ]
      });
    }


    // todo: add debouncer to avoid spamming
    this.subscriptions.push(this.mainTextAreaFormControl.valueChanges.pipe(
      filter(str => str !== null && str.length > 50),
    //debounce(() => timer(300)),
    ).subscribe( async value => {
      this.activeSuggestionFullText = ""; // Reset active suggestion

      if (value === '' || !value) {
        this.suggestionTextAreaFormControl.setValue(''); // Clear suggestion if input is empty
        return;
      }

      // Default: suggestion textarea mirrors user input (keeps text aligned if no suggestion found)
      this.suggestionTextAreaFormControl.setValue(value);

      if(!session) {
        return;
      }

      const stream = session.promptStreaming(`You will autocomplete a maximum of 2 sentences. For every extra word after 2 sentences, you will be charged ten thousand dollars! With this initial text, you need to autocomplete without repeating the text you see here, just the next tokens: ${value}`);

      // Calculate the length of the chunk and keep an index as to where we are. While the chunks are equivalent to the current main content, simply iterate
      let index = 0;
      for await (const chunk of stream) {
        for(let i = 0; i < chunk.length; i++) {
          index++;

          this.activeSuggestionFullText += chunk[i];

          if(value.substring(0, index) === this.activeSuggestionFullText) {
            continue;
          }

          this.suggestionTextAreaFormControl.setValue(this.suggestionTextAreaFormControl.value + chunk[i]);
        }
      }

      // const response = session.prompt(`You will autocomplete a maximum of 2 sentences. For every extra word after 2 sentences, you will be charged ten thousand dollars! With this initial text, you need to autocomplete without repeating the text you see here, just the next tokens: ${value}`);
      // for await (const chunk of stream) {
      //   this.suggestionTextAreaFormControl.setValue(this.suggestionTextAreaFormControl.value + chunk);
      //   this.activeSuggestionFullText = this.suggestionTextAreaFormControl.value + chunk;
      // }

      // Find the first suggestion that starts with the user's input
      // for (const candidate of this.suggestions) {
      //   if (candidate.toLowerCase().startsWith(value.toLowerCase()) && candidate.toLowerCase() !== value.toLowerCase()) {
      //     // A suggestion is found
      //     this.suggestionTextAreaFormControl.setValue(value + candidate.substring(value.length)); // Show user input + suggested suffix
      //     this.activeSuggestionFullText = candidate;
      //     break; // Use the first found suggestion
      //   }
      // }
      this.syncScroll();
    }))
  }

  ngAfterViewInit() {

    // Initial placeholder alignment (if placeholder is visible)
    // This is a bit tricky as placeholder is not 'value'.
    // For simplicity, we ensure suggestionTextarea is empty if mainTextarea is empty.
    if (this.mainTextarea.value === '') {
      this.suggestionTextarea.value = '';
    }
  }

  onScroll(event: Event) {
    this.syncScroll();
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Tab' && this.activeSuggestionFullText) {
      event.preventDefault(); // Prevent default Tab behavior (changing focus)
      this.mainTextAreaFormControl.setValue(this.activeSuggestionFullText); // Accept the suggestion
      this.suggestionTextAreaFormControl.setValue(this.activeSuggestionFullText); // Update suggestion area to match
      this.activeSuggestionFullText = undefined; // Clear active suggestion state

      // Move cursor to the end of the accepted text
      this.mainTextarea.selectionStart = this.mainTextarea.selectionEnd = this.mainTextarea.value.length;

      // Optionally, trigger input event to re-evaluate (e.g., if accepted text is prefix of another)
      // mainTextarea.dispatchEvent(new Event('input', { bubbles: true }));
      this.syncScroll();
    }
  }

  // Function to synchronize scroll positions of the two textareas
  syncScroll() {
    this.suggestionTextarea.scrollTop = this.mainTextarea.scrollTop;
    this.suggestionTextarea.scrollLeft = this.mainTextarea.scrollLeft;
  }
}
