import { Component, input } from '@angular/core';
import { CurrencyPipe, NgClass } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [NgClass, CurrencyPipe],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
})
export class CardComponent {

  currency = input({title: '', currentValue: 0, variation: '', updated: ''});

}
