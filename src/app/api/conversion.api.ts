import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { USE_QUOTE_TOKEN } from '../interceptors/quote-api.interceptor';
import { IQuote } from '../domain/quote';
import { IQuoteResponse } from '../domain/quoteResponse';

@Injectable({
  providedIn: 'root',
})
export class ConversionApi {

  constructor(private httpClient: HttpClient) {}

  getQuotes(): Observable<Record<string, IQuoteResponse>> {
    return this.httpClient.get<Record<string, IQuoteResponse>>(`${environment.quoteApi.baseUrl}CAD-BRL,ARS-BRL,GBP-BRL`, {
      context: new HttpContext().set(USE_QUOTE_TOKEN, true)
    });
  }

}
