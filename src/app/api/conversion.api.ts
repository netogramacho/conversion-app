import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ConversionApi {

  constructor(private httpClient: HttpClient) {}

  getQuotes(): Observable<any> {
    return this.httpClient.get('https://economia.awesomeapi.com.br/json/last/CAD-BRL,ARS-BRL,GBP-BRL');
  }

}
