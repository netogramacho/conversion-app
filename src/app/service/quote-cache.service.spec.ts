import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { QuoteCacheService } from './quote-cache.service';
import { IQuote } from '../domain/quote';

describe('QuoteCacheService', () => {
  let service: QuoteCacheService;
  const mockQuotes: IQuote[] = [
    {
      code: 'USD',
      title: 'Dólar',
      currentValue: 5.25,
      variation: '+0.5%',
      updated: '2026-01-30'
    },
    {
      code: 'EUR',
      title: 'Euro',
      currentValue: 6.10,
      variation: '-0.2%',
      updated: '2026-01-30'
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QuoteCacheService);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('set and get', () => {
    it('should store and retrieve data correctly', () => {
      service.set(mockQuotes);
      const result = service.get();

      expect(result).toEqual(mockQuotes);
    });

    it('should return null when cache is empty', () => {
      const result = service.get();
      expect(result).toBeNull();
    });

    it('should include timestamp and expiresAt when storing', () => {
      const beforeSet = Date.now();
      service.set(mockQuotes);
      const afterSet = Date.now();

      const cached = localStorage.getItem('conversion_quotes_cache');
      expect(cached).toBeTruthy();

      const cacheData = JSON.parse(cached!);
      expect(cacheData.data).toEqual(mockQuotes);
      expect(cacheData.timestamp).toBeGreaterThanOrEqual(beforeSet);
      expect(cacheData.timestamp).toBeLessThanOrEqual(afterSet);
      expect(cacheData.expiresAt).toBeGreaterThan(cacheData.timestamp);
    });
  });

  describe('cache expiration', () => {
    it('should return null for expired cache', () => {
      // Simula cache expirado manualmente
      const expiredData = {
        data: mockQuotes,
        timestamp: Date.now() - 200000,
        expiresAt: Date.now() - 10000 // expirado há 10 segundos
      };
      localStorage.setItem('conversion_quotes_cache', JSON.stringify(expiredData));

      const result = service.get();
      expect(result).toBeNull();
    });

    it('should clear expired cache automatically', () => {
      const expiredData = {
        data: mockQuotes,
        timestamp: Date.now() - 200000,
        expiresAt: Date.now() - 10000
      };
      localStorage.setItem('conversion_quotes_cache', JSON.stringify(expiredData));

      service.get();

      const cached = localStorage.getItem('conversion_quotes_cache');
      expect(cached).toBeNull();
    });

    it('should return valid cache when not expired', () => {
      const validData = {
        data: mockQuotes,
        timestamp: Date.now(),
        expiresAt: Date.now() + 180000 // expira em 3 minutos
      };
      localStorage.setItem('conversion_quotes_cache', JSON.stringify(validData));

      const result = service.get();
      expect(result).toEqual(mockQuotes);
    });
  });

  describe('clear', () => {
    it('should remove cache from localStorage', () => {
      service.set(mockQuotes);
      expect(localStorage.getItem('conversion_quotes_cache')).toBeTruthy();

      service.clear();
      expect(localStorage.getItem('conversion_quotes_cache')).toBeNull();
    });

    it('should not throw error when clearing empty cache', () => {
      expect(() => service.clear()).not.toThrow();
    });
  });

  describe('getRemainingTime', () => {
    it('should return remaining time for valid cache', () => {
      const now = Date.now();
      const validData = {
        data: mockQuotes,
        timestamp: now,
        expiresAt: now + 180000
      };
      localStorage.setItem('conversion_quotes_cache', JSON.stringify(validData));

      const remaining = service.getRemainingTime();
      expect(remaining).toBeGreaterThan(0);
      expect(remaining).toBeLessThanOrEqual(180000);
    });

    it('should return 0 for expired cache', () => {
      const expiredData = {
        data: mockQuotes,
        timestamp: Date.now() - 200000,
        expiresAt: Date.now() - 10000
      };
      localStorage.setItem('conversion_quotes_cache', JSON.stringify(expiredData));

      const remaining = service.getRemainingTime();
      expect(remaining).toBe(0);
    });

    it('should return 0 when cache is empty', () => {
      const remaining = service.getRemainingTime();
      expect(remaining).toBe(0);
    });
  });

  describe('data validation', () => {
    it('should return null for corrupted JSON', () => {
      localStorage.setItem('conversion_quotes_cache', 'invalid json{');

      const result = service.get();
      expect(result).toBeNull();
    });

    it('should return null for invalid cache structure', () => {
      const invalidData = {
        data: mockQuotes,
        // falta timestamp e expiresAt
      };
      localStorage.setItem('conversion_quotes_cache', JSON.stringify(invalidData));

      const result = service.get();
      expect(result).toBeNull();
    });

    it('should return null for invalid quote structure in data array', () => {
      const invalidData = {
        data: [{ invalid: 'structure' }],
        timestamp: Date.now(),
        expiresAt: Date.now() + 180000
      };
      localStorage.setItem('conversion_quotes_cache', JSON.stringify(invalidData));

      const result = service.get();
      expect(result).toBeNull();
    });

    it('should return null when JSON parse fails', () => {
      localStorage.setItem('conversion_quotes_cache', 'invalid');

      const result = service.get();

      // Deve retornar null mas não necessariamente limpar o cache no catch
      expect(result).toBeNull();
    });
  });

  describe('error handling', () => {
    it('should handle localStorage SecurityError gracefully', () => {
      vi.spyOn(localStorage, 'getItem').mockImplementation(() => {
        throw new Error('SecurityError');
      });

      const result = service.get();
      expect(result).toBeNull();
    });

    it('should handle localStorage QuotaExceededError on set', () => {
      vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });

      expect(() => service.set(mockQuotes)).not.toThrow();
    });

    it('should handle errors on clear gracefully', () => {
      vi.spyOn(localStorage, 'removeItem').mockImplementation(() => {
        throw new Error('Error');
      });

      expect(() => service.clear()).not.toThrow();
    });
  });
});
