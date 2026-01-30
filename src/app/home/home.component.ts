import { ConversionService } from './../service/conversion.service';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CardComponent } from '../shared/components/card/card.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit, OnDestroy {

  conversionService = inject(ConversionService);
  quotes = this.conversionService.quotes;
  loading = this.conversionService.loading;
  error = this.conversionService.error;

  ngOnInit(): void {
    this.conversionService.startGetConversionRates();
  }

  ngOnDestroy(): void {
    this.conversionService.stopGetConversionRates();
  }

  reload() {
    this.conversionService.forceRefresh();
  }

}
