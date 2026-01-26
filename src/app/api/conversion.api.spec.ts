import { TestBed } from '@angular/core/testing';

import { ConversionApi } from './conversion.api';

describe('ConversionApi', () => {
  let service: ConversionApi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConversionApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
