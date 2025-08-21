import { TestBed } from '@angular/core/testing';

import { WebAiStudioService } from './web-ai-studio.service';

describe('WebAiStudioService', () => {
  let service: WebAiStudioService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WebAiStudioService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
