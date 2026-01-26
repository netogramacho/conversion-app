import { Component, input, computed } from '@angular/core';
import { CurrencyPipe, NgClass } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
})
export class CardComponent {

  currency = input({title: '', currentValue: 0, variation: '', updated: ''});

  valueColorClass = computed(() => {
    const value = this.currency().currentValue;
    if (value <= 1) return 'text-red';
    if (value > 5) return 'text-blue';
    return 'text-green';
  });

}
