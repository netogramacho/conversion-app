import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { ConversionService } from './conversion.service';
import { ConversionApi } from '../api/conversion.api';
import { IQuoteResponse } from '../domain/quoteResponse';
import { QuoteCacheService } from './quote-cache.service';
import { IQuote } from '../domain/quote';

describe('ConversionService', () => {
  let service: ConversionService;
  let conversionApiMock: { getQuotes: ReturnType<typeof vi.fn> };
  let quoteCacheServiceMock: {
    get: ReturnType<typeof vi.fn>;
    set: ReturnType<typeof vi.fn>;
    clear: ReturnType<typeof vi.fn>;
    getRemainingTime: ReturnType<typeof vi.fn>;
  };

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

    quoteCacheServiceMock = {
      get: vi.fn().mockReturnValue(null),
      set: vi.fn(),
      clear: vi.fn(),
      getRemainingTime: vi.fn().mockReturnValue(0)
    };

    TestBed.configureTestingModule({
      providers: [
        ConversionService,
        { provide: ConversionApi, useValue: conversionApiMock },
        { provide: QuoteCacheService, useValue: quoteCacheServiceMock }
      ]
    });

    service = TestBed.inject(ConversionService);
  });

  afterEach(() => {
    service.stopGetConversionRates();
    localStorage.clear();
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

  describe('Cache Integration and Smart Polling', () => {
    const mockCachedQuotes: IQuote[] = [
      {
        code: 'USD',
        title: 'Dólar',
        currentValue: 5.50,
        variation: '+1.2%',
        updated: '10:00:00'
      }
    ];

    describe('Cache Hit - Valid Cache', () => {
      it('should emit quotes immediately from cache without HTTP call', async () => {
        quoteCacheServiceMock.get.mockReturnValue(mockCachedQuotes);
        quoteCacheServiceMock.getRemainingTime.mockReturnValue(150000); // 2.5 minutos restantes

        service.startGetConversionRates();

        // Quotes should be set immediately from cache
        expect(service.quotes()).toEqual(mockCachedQuotes);
        
        // No immediate HTTP call
        expect(conversionApiMock.getQuotes).not.toHaveBeenCalled();
      });

      it('should calculate initial delay based on remaining cache time', async () => {
        const remainingTime = 120000; // 2 minutos
        quoteCacheServiceMock.get.mockReturnValue(mockCachedQuotes);
        quoteCacheServiceMock.getRemainingTime.mockReturnValue(remainingTime);

        service.startGetConversionRates();
        
        // Quotes loaded from cache
        expect(service.quotes()).toEqual(mockCachedQuotes);
        
        // No immediate call
        expect(conversionApiMock.getQuotes).not.toHaveBeenCalled();
      });

      it('should handle negative remaining time as zero delay', async () => {
        quoteCacheServiceMock.get.mockReturnValue(mockCachedQuotes);
        quoteCacheServiceMock.getRemainingTime.mockReturnValue(-5000); // tempo negativo
        conversionApiMock.getQuotes.mockReturnValue(of(mockApiResponse));

        service.startGetConversionRates();
        await new Promise(resolve => setTimeout(resolve, 10));

        // Should make immediate HTTP call with 0 delay
        expect(conversionApiMock.getQuotes).toHaveBeenCalled();
      });
    });

    describe('Cache Miss - No Cache or Expired', () => {
      it('should make immediate HTTP call when cache is empty', async () => {
        quoteCacheServiceMock.get.mockReturnValue(null);
        quoteCacheServiceMock.getRemainingTime.mockReturnValue(0);
        conversionApiMock.getQuotes.mockReturnValue(of(mockApiResponse));

        service.startGetConversionRates();
        await new Promise(resolve => setTimeout(resolve, 10));

        expect(conversionApiMock.getQuotes).toHaveBeenCalled();
      });

      it('should make immediate HTTP call when cache is expired', async () => {
        quoteCacheServiceMock.get.mockReturnValue(null);
        quoteCacheServiceMock.getRemainingTime.mockReturnValue(0);
        conversionApiMock.getQuotes.mockReturnValue(of(mockApiResponse));

        service.startGetConversionRates();
        await new Promise(resolve => setTimeout(resolve, 10));

        expect(conversionApiMock.getQuotes).toHaveBeenCalled();
        expect(service.loading()).toBeFalsy();
      });
    });

    describe('Cache Persistence After API Response', () => {
      it('should save data to cache after successful API call', async () => {
        quoteCacheServiceMock.get.mockReturnValue(null);
        quoteCacheServiceMock.getRemainingTime.mockReturnValue(0);
        conversionApiMock.getQuotes.mockReturnValue(of(mockApiResponse));

        service.startGetConversionRates();
        await new Promise(resolve => setTimeout(resolve, 10));

        expect(quoteCacheServiceMock.set).toHaveBeenCalled();
        const savedQuotes = quoteCacheServiceMock.set.mock.calls[0][0];
        expect(savedQuotes).toHaveLength(3);
        expect(savedQuotes[0].code).toBe('CAD');
      });

      it('should not save to cache on API error', async () => {
        quoteCacheServiceMock.get.mockReturnValue(null);
        quoteCacheServiceMock.getRemainingTime.mockReturnValue(0);
        conversionApiMock.getQuotes.mockReturnValue(throwError(() => new Error('API Error')));

        service.startGetConversionRates();
        await new Promise(resolve => setTimeout(resolve, 10));

        expect(quoteCacheServiceMock.set).not.toHaveBeenCalled();
      });
    });
  });

  describe('forceRefresh', () => {
    it('should clear cache and restart polling', async () => {
      quoteCacheServiceMock.get.mockReturnValue(null);
      quoteCacheServiceMock.getRemainingTime.mockReturnValue(0);
      conversionApiMock.getQuotes.mockReturnValue(of(mockApiResponse));

      service.forceRefresh();

      expect(quoteCacheServiceMock.clear).toHaveBeenCalled();
      
      await new Promise(resolve => setTimeout(resolve, 10));
      expect(conversionApiMock.getQuotes).toHaveBeenCalled();
    });

    it('should force immediate API call even with valid cache', async () => {
      // Reset mocks to simulate cleared cache before forceRefresh
      quoteCacheServiceMock.get.mockReturnValue(null);
      quoteCacheServiceMock.getRemainingTime.mockReturnValue(0);
      conversionApiMock.getQuotes.mockReturnValue(of(mockApiResponse));

      service.forceRefresh();

      expect(quoteCacheServiceMock.clear).toHaveBeenCalled();
      
      await new Promise(resolve => setTimeout(resolve, 10));
      expect(conversionApiMock.getQuotes).toHaveBeenCalled();
    });
  });
});

