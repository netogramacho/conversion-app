import { inject, Injectable, signal } from '@angular/core';
import { ConversionApi } from '../api/conversion.api';
import { IQuote } from '../shared/quote';
import { delay, map, Subscription, switchMap, tap, timer } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ConversionService {
  private conversionApi = inject(ConversionApi);

  private readonly INITIAL_QUOTES: IQuote[] = [
  { title: 'Dólar Canadense' },
  { title: 'Peso Argentino' },
  { title: 'Libra Esterlina' },
];

  private readonly TTL = 0.25*60*1000;

  quotes = signal<IQuote[]>(this.INITIAL_QUOTES);
  loading = signal(false);
  error = signal<string | null>(null);

  private refresh$ = timer(0, this.TTL);
  private subscription?: Subscription;

  startGetConversionRates() {
    this.subscription = this.refresh$
      .pipe(
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
          this.loading.set(false);
          console.error('Error fetching conversion rates:', err);
        }
      });
  }

  stopGetConversionRates() {
    this.subscription?.unsubscribe();
  }

  private mapResponseToQuotes(response: any): IQuote[] {
    return Object.values(response).map((item: any) => ({
        code: item.code,
        title: item.name.split('/')[0],
        currentValue: item.bid,
        variation: item.pctChange,
        updated: item.create_date.split(' ')[1],
    }));
  }

}
