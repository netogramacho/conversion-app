import { Component } from '@angular/core';
import { CardComponent } from '../shared/components/card/card.component';
import { ɵEmptyOutletComponent } from "@angular/router";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {

  data = [
    { title: 'Peso Argentino', currentValue: 4.37, variation: '+2,34%', updated: '08:00:54' },
    { title: 'Dólar Canadense', currentValue: 0.05, variation: '+1,12%', updated: '08:00:54' },
    { title: 'Libra Esterlina', currentValue: 7.52, variation: '-0,56%', updated: '08:00:54' },
  ];

}
