import { TestBed } from '@angular/core/testing';

import { PruebaServices } from './prueba.services';

describe('PruebaServices', () => {
  let service: PruebaServices;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PruebaServices);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
