import { Injectable } from '@angular/core';
import { IQuote } from '../domain/quote';
import { environment } from '../../environments/environment';

interface CacheData {
  data: IQuote[];
  timestamp: number;
  expiresAt: number;
}

@Injectable({
  providedIn: 'root'
})
export class QuoteCacheService {
  private readonly CACHE_KEY = 'conversion_quotes_cache';

  constructor() { }

  get(): IQuote[] | null {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);

      if (!cached) {
        return null;
      }

      const cacheData: CacheData = JSON.parse(cached);

      if (!this.isValidCacheData(cacheData)) {
        this.clear();
        return null;
      }

      if (Date.now() > cacheData.expiresAt) {
        this.clear();
        return null;
      }

      return cacheData.data;
    } catch (error) {
      console.warn('Erro ao acessar cache:', error);
      return null;
    }
  }

  set(data: IQuote[]): void {
    try {
      const now = Date.now();
      const cacheData: CacheData = {
        data,
        timestamp: now,
        expiresAt: now + environment.CACHE_TTL
      };

      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Erro ao salvar cache:', error);
    }
  }

  clear(): void {
    try {
      localStorage.removeItem(this.CACHE_KEY);
    } catch (error) {
      console.warn('Erro ao limpar cache:', error);
    }
  }

  getRemainingTime(): number {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);

      if (!cached) {
        return 0;
      }

      const cacheData: CacheData = JSON.parse(cached);

      if (!this.isValidCacheData(cacheData)) {
        return 0;
      }

      const remaining = cacheData.expiresAt - Date.now();
      return remaining > 0 ? remaining : 0;
    } catch (error) {
      return 0;
    }
  }

  private isValidCacheData(data: any): data is CacheData {
    return (
      data &&
      typeof data === 'object' &&
      Array.isArray(data.data) &&
      typeof data.timestamp === 'number' &&
      typeof data.expiresAt === 'number' &&
      data.data.every((item: any) => this.isValidQuote(item))
    );
  }

  private isValidQuote(item: any): item is IQuote {
    return (
      item &&
      typeof item === 'object' &&
      typeof item.title === 'string' &&
      (item.code === undefined || typeof item.code === 'string') &&
      (item.currentValue === undefined || typeof item.currentValue === 'number') &&
      (item.variation === undefined || typeof item.variation === 'string') &&
      (item.updated === undefined || typeof item.updated === 'string')
    );
  }
}
