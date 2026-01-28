import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ConversionApi } from './conversion.api';
import { environment } from '../../environments/environment';
import { USE_QUOTE_TOKEN } from '../interceptors/quote-api.interceptor';
import { IQuoteResponse } from '../domain/quoteResponse';

describe('ConversionApi', () => {
  let service: ConversionApi;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        ConversionApi
      ]
    });
    service = TestBed.inject(ConversionApi);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getQuotes', () => {
    it('should make GET request to correct URL with currency pairs', () => {
      const mockResponse: Record<string, IQuoteResponse> = {
        'CADBRL': {
          name: 'Dólar Canadense/Real Brasileiro',
          code: 'CAD',
          codein: 'BRL',
          bid: '3.85',
          pctChange: '1.2',
          create_date: '2026-01-27 10:30:00'
        }
      };

      service.getQuotes().subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const expectedUrl = `${environment.quoteApi.baseUrl}CAD-BRL,ARS-BRL,GBP-BRL`;
      const req = httpMock.expectOne(expectedUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should return Observable of quote responses', () => {
      const mockResponse: Record<string, IQuoteResponse> = {
        'CADBRL': {
          name: 'Dólar Canadense/Real Brasileiro',
          code: 'CAD',
          bid: '3.85',
          pctChange: '1.2',
          create_date: '2026-01-27 10:30:00'
        },
        'ARSBRL': {
          name: 'Peso Argentino/Real Brasileiro',
          code: 'ARS',
          bid: '0.05',
          pctChange: '-0.5',
          create_date: '2026-01-27 10:30:00'
        },
        'GBPBRL': {
          name: 'Libra Esterlina/Real Brasileiro',
          code: 'GBP',
          bid: '6.25',
          pctChange: '0.8',
          create_date: '2026-01-27 10:30:00'
        }
      };

      service.getQuotes().subscribe(response => {
        expect(response).toBeDefined();
        expect(Object.keys(response).length).toBe(3);
        expect(response['CADBRL']).toBeDefined();
        expect(response['ARSBRL']).toBeDefined();
        expect(response['GBPBRL']).toBeDefined();
      });

      const req = httpMock.expectOne(req => req.url.includes('CAD-BRL,ARS-BRL,GBP-BRL'));
      req.flush(mockResponse);
    });

    it('should set USE_QUOTE_TOKEN context to true when API key exists', () => {
      const originalApiKey = environment.quoteApi.apiKey;
      environment.quoteApi.apiKey = 'test-api-key';

      service.getQuotes().subscribe();

      const req = httpMock.expectOne(req => req.url.includes('CAD-BRL'));
      expect(req.request.context.get(USE_QUOTE_TOKEN)).toBe(true);
      req.flush({});

      environment.quoteApi.apiKey = originalApiKey;
    });

    it('should set USE_QUOTE_TOKEN context to false when API key does not exist', () => {
      const originalApiKey = environment.quoteApi.apiKey;
      environment.quoteApi.apiKey = '';

      service.getQuotes().subscribe();

      const req = httpMock.expectOne(req => req.url.includes('CAD-BRL'));
      expect(req.request.context.get(USE_QUOTE_TOKEN)).toBe(false);
      req.flush({});

      environment.quoteApi.apiKey = originalApiKey;
    });
  });

  describe('checkApiTokenExists', () => {
    it('should return true when environment.quoteApi.apiKey exists', () => {
      const originalApiKey = environment.quoteApi.apiKey;
      environment.quoteApi.apiKey = 'test-api-key';

      const result = (service as any).checkApiTokenExists();
      expect(result).toBe(true);

      environment.quoteApi.apiKey = originalApiKey;
    });

    it('should return false when environment.quoteApi.apiKey is empty', () => {
      const originalApiKey = environment.quoteApi.apiKey;
      environment.quoteApi.apiKey = '';

      const result = (service as any).checkApiTokenExists();
      expect(result).toBe(false);

      environment.quoteApi.apiKey = originalApiKey;
    });

    it('should return false when environment.quoteApi.apiKey is null or undefined', () => {
      const originalApiKey = environment.quoteApi.apiKey;
      environment.quoteApi.apiKey = null as any;

      const result = (service as any).checkApiTokenExists();
      expect(result).toBe(false);

      environment.quoteApi.apiKey = originalApiKey;
    });
  });
});
