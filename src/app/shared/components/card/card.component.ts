import { Component, input, computed, output } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { IQuote } from '../../quote';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
})
export class CardComponent {

  private readonly VALUE_THRESHOLDS = {
    LOW: 1,
    HIGH: 5,
  };

  currency = input.required<IQuote>();
  loading = input<boolean>(false);
  error = input<string | null>(null);

  reloadRequest = output<void>();

  valueColorClass = computed(() => {
    const value = this.currency()?.currentValue;
    if (!value || value <= this.VALUE_THRESHOLDS.LOW) return 'text-red';
    if (value > this.VALUE_THRESHOLDS.HIGH) return 'text-blue';
    return 'text-green';
  });

  reload() {
    this.reloadRequest.emit();
  }

  getValueDescription(): string {
    const value = this.currency()?.currentValue;
    if (!value) return 'Valor indisponível';
    if (value <= 1) return `Valor baixo: ${value}`;
    if (value > 5) return `Valor alto: ${value}`;
    return `Valor médio: ${value}`;
  }

}
