import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WebAiStudioComponent } from './web-ai-studio.component';

describe('WebAiStudioComponent', () => {
  let component: WebAiStudioComponent;
  let fixture: ComponentFixture<WebAiStudioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WebAiStudioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WebAiStudioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
