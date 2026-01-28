import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { ConversionService } from './conversion.service';
import { ConversionApi } from '../api/conversion.api';
import { IQuoteResponse } from '../domain/quoteResponse';

describe('ConversionService', () => {
  let service: ConversionService;
  let conversionApiMock: { getQuotes: ReturnType<typeof vi.fn> };

  const mockApiResponse: Record<string, IQuoteResponse> = {
    'CADBRL': {
      code: 'CAD',
      codein: 'BRL',
      name: 'Dólar Canadense/Real Brasileiro',
      bid: '4.25',
      ask: '4.26',
      varBid: '0.05',
      pctChange: '1.19',
      high: '4.30',
      low: '4.20',
      timestamp: '1706371200',
      create_date: '2026-01-27 10:30:00'
    },
    'ARSBRL': {
      code: 'ARS',
      codein: 'BRL',
      name: 'Peso Argentino/Real Brasileiro',
      bid: '0.0058',
      ask: '0.0059',
      varBid: '-0.0001',
      pctChange: '-1.69',
      high: '0.0060',
      low: '0.0057',
      timestamp: '1706371200',
      create_date: '2026-01-27 10:30:00'
    },
    'GBPBRL': {
      code: 'GBP',
      codein: 'BRL',
      name: 'Libra Esterlina/Real Brasileiro',
      bid: '7.15',
      ask: '7.16',
      varBid: '0.10',
      pctChange: '1.42',
      high: '7.20',
      low: '7.10',
      timestamp: '1706371200',
      create_date: '2026-01-27 10:30:00'
    }
  };

  beforeEach(() => {
    conversionApiMock = {
      getQuotes: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        ConversionService,
        { provide: ConversionApi, useValue: conversionApiMock }
      ]
    });

    service = TestBed.inject(ConversionService);
  });

  afterEach(() => {
    service.stopGetConversionRates();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Initial State', () => {
    it('should initialize with default quotes', () => {
      const initialQuotes = service.quotes();
      expect(initialQuotes.length).toBe(3);
      expect(initialQuotes[0].title).toBe('Dólar Canadense');
      expect(initialQuotes[1].title).toBe('Peso Argentino');
      expect(initialQuotes[2].title).toBe('Libra Esterlina');
    });

    it('should initialize loading as false', () => {
      expect(service.loading()).toBeFalsy();
    });

    it('should initialize error as null', () => {
      expect(service.error()).toBeNull();
    });
  });

  describe('startGetConversionRates', () => {
    it('should set loading to true when starting', async () => {
      conversionApiMock.getQuotes.mockReturnValue(of(mockApiResponse));

      service.startGetConversionRates();

      // Use setTimeout to wait for next microtask
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(conversionApiMock.getQuotes).toHaveBeenCalled();
      expect(service.loading()).toBeFalsy();
      expect(service.quotes().length).toBe(3);
    });

    it('should call API and update quotes with mapped data', async () => {
      conversionApiMock.getQuotes.mockReturnValue(of(mockApiResponse));

      service.startGetConversionRates();
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(conversionApiMock.getQuotes).toHaveBeenCalled();

      const quotes = service.quotes();
      expect(quotes.length).toBe(3);
      expect(quotes[0].code).toBe('CAD');
      expect(quotes[0].title).toBe('Dólar Canadense');
      expect(quotes[0].currentValue).toBe(4.25);
      expect(quotes[0].variation).toBe('1.19');
      expect(quotes[0].updated).toBe('10:30:00');
    });

    it('should map all response fields correctly', async () => {
      conversionApiMock.getQuotes.mockReturnValue(of(mockApiResponse));

      service.startGetConversionRates();
      await new Promise(resolve => setTimeout(resolve, 0));

      const quotes = service.quotes();

      // Check CAD
      expect(quotes[0].code).toBe('CAD');
      expect(quotes[0].currentValue).toBe(4.25);
      expect(quotes[0].variation).toBe('1.19');

      // Check ARS
      expect(quotes[1].code).toBe('ARS');
      expect(quotes[1].currentValue).toBe(0.0058);
      expect(quotes[1].variation).toBe('-1.69');

      // Check GBP
      expect(quotes[2].code).toBe('GBP');
      expect(quotes[2].currentValue).toBe(7.15);
      expect(quotes[2].variation).toBe('1.42');
    });

    it('should handle missing bid value', async () => {
      const responseWithoutBid = {
        'CADBRL': {
          ...mockApiResponse['CADBRL'],
          bid: undefined
        }
      };

      conversionApiMock.getQuotes.mockReturnValue(of(responseWithoutBid));

      service.startGetConversionRates();
      await new Promise(resolve => setTimeout(resolve, 0));

      const quotes = service.quotes();
      expect(quotes[0].currentValue).toBeUndefined();
    });

    it('should set error message and stop polling on API error', async () => {
      conversionApiMock.getQuotes.mockReturnValue(throwError(() => new Error('API Error')));

      service.startGetConversionRates();
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(service.error()).toBe('Algo deu errado.');
      expect(service.loading()).toBeFalsy();
    });

    it('should refresh quotes periodically', async () => {
      conversionApiMock.getQuotes.mockReturnValue(of(mockApiResponse));

      service.startGetConversionRates();
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(conversionApiMock.getQuotes).toHaveBeenCalledTimes(1);
      expect(service.quotes()[0].code).toBe('CAD');
    });

    it('should stop previous subscription when starting again', async () => {
      conversionApiMock.getQuotes.mockReturnValue(of(mockApiResponse));

      service.startGetConversionRates();
      await new Promise(resolve => setTimeout(resolve, 0));

      const firstCallCount = conversionApiMock.getQuotes.mock.calls.length;
      expect(firstCallCount).toBeGreaterThan(0);

      service.startGetConversionRates();
      await new Promise(resolve => setTimeout(resolve, 0));

      // Should have called again
      expect(conversionApiMock.getQuotes.mock.calls.length).toBeGreaterThan(firstCallCount);
    });
  });

  describe('stopGetConversionRates', () => {
    it('should stop the polling', async () => {
      conversionApiMock.getQuotes.mockReturnValue(of(mockApiResponse));

      service.startGetConversionRates();
      await new Promise(resolve => setTimeout(resolve, 0));

      const callCount = conversionApiMock.getQuotes.mock.calls.length;
      expect(callCount).toBeGreaterThan(0);

      service.stopGetConversionRates();

      // Verify no more calls are made after stopping
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(conversionApiMock.getQuotes.mock.calls.length).toBe(callCount);
    });
  });
});
