import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { ConversionApi } from '../api/conversion.api';
import { IQuote } from '../domain/quote';
import { map, Subject, Subscription, switchMap, takeUntil, tap, timer } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IQuoteResponse } from '../domain/quoteResponse';
import { QuoteCacheService } from './quote-cache.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ConversionService {
  private conversionApi = inject(ConversionApi);
  private quoteCacheService = inject(QuoteCacheService);
  private destroyRef = inject(DestroyRef);

  private stopSignal$ = new Subject<void>();

  private readonly INITIAL_QUOTES: IQuote[] = [
  { title: 'Dólar Canadense' },
  { title: 'Peso Argentino' },
  { title: 'Libra Esterlina' },
];

  quotes = signal<IQuote[]>(this.INITIAL_QUOTES);
  loading = signal(false);
  error = signal<string | null>(null);

  private subscription?: Subscription;

  startGetConversionRates() {
    this.stopSignal$.next();

    const cachedQuotes = this.quoteCacheService.get();
    const remainingTime = this.quoteCacheService.getRemainingTime();

    if (cachedQuotes) {
      this.quotes.set(cachedQuotes);
    }

    const initialDelay = remainingTime > 0 ? remainingTime : 0;

    this.subscription = timer(initialDelay, environment.CACHE_TTL)
      .pipe(
        takeUntil(this.stopSignal$),
        takeUntilDestroyed(this.destroyRef),
        tap(() => {
          this.loading.set(true);
          this.error.set(null);
        }),
        switchMap(() => this.conversionApi.getQuotes()),
        map(response => this.mapResponseToQuotes(response)),
      )
      .subscribe({
        next: quotes => {
          this.quotes.set(quotes);
          this.loading.set(false);
        },
        error: err => {
          this.error.set('Algo deu errado.');
          this.stopGetConversionRates();
          this.loading.set(false);
        }
      });
  }

  stopGetConversionRates() {
    this.stopSignal$.next();
  }

  forceRefresh() {
    this.quoteCacheService.clear();
    this.startGetConversionRates();
  }

  private mapResponseToQuotes(response: Record<string, IQuoteResponse>): IQuote[] {
    const quotes = Object.values(response).map((item) => ({
        code: item.code,
        title: item.name.split('/')[0],
        currentValue: item.bid ? parseFloat(item.bid) : undefined,
        variation: item.pctChange,
        updated: item.create_date?.split(' ')[1],
    }));

    this.quoteCacheService.set(quotes);

    return quotes;
  }

}
