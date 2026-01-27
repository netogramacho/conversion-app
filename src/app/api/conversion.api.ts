import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { USE_QUOTE_TOKEN } from '../intereceptors/quote-api.interceptor';

@Injectable({
  providedIn: 'root',
})
export class ConversionApi {

  constructor(private httpClient: HttpClient) {}

  getQuotes(): Observable<any> {
    return this.httpClient.get(`${environment.quoteApi.baseUrl}CAD-BRL,ARS-BRL,GBP-BRL`, {
      context: new HttpContext().set(USE_QUOTE_TOKEN, true)
    });
  }

}
