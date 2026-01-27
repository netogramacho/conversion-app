import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { ConversionApi } from '../api/conversion.api';
import { IQuote } from '../domain/quote';
import { map, Subject, Subscription, switchMap, takeUntil, tap, timer } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IQuoteResponse } from '../domain/quoteResponse';

@Injectable({
  providedIn: 'root',
})
export class ConversionService {
  private conversionApi = inject(ConversionApi);
  private destroyRef = inject(DestroyRef);

  private stopSignal$ = new Subject<void>();

  private readonly INITIAL_QUOTES: IQuote[] = [
  { title: 'Dólar Canadense' },
  { title: 'Peso Argentino' },
  { title: 'Libra Esterlina' },
];

  private readonly TTL = 180000; // 3 minutes

  quotes = signal<IQuote[]>(this.INITIAL_QUOTES);
  loading = signal(false);
  error = signal<string | null>(null);

  private refresh$ = timer(0, this.TTL);
  private subscription?: Subscription;

  startGetConversionRates() {
    this.stopSignal$.next();

    this.subscription = this.refresh$
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

  private mapResponseToQuotes(response: Record<string, IQuoteResponse>): IQuote[] {
    return Object.values(response).map((item) => ({
        code: item.code,
        title: item.name.split('/')[0],
        currentValue: item.bid ? parseFloat(item.bid) : undefined,
        variation: item.pctChange,
        updated: item.create_date?.split(' ')[1],
    }));
  }

}
