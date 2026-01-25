import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CardComponent } from './card.component';
import { ComponentRef } from '@angular/core';

describe('CardComponent', () => {
  let component: CardComponent;
  let fixture: ComponentFixture<CardComponent>;
  let compiled: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardComponent);
    component = fixture.componentInstance;
    compiled = fixture.nativeElement;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render currency title', () => {
    fixture.componentRef.setInput('currency', {
      title: 'Dólar Americano',
      currentValue: 5.25,
      variation: '+1.5%',
      updated: '10:00'
    });
    fixture.detectChanges();

    const titleElement = compiled.querySelector('.card-header-title');
    expect(titleElement?.textContent).toBe('Dólar Americano');
  });

  it('should render currency value with BRL format', () => {
    fixture.componentRef.setInput('currency', {
      title: 'Euro',
      currentValue: 6.10,
      variation: '+2.3%',
      updated: '11:30'
    });
    fixture.detectChanges();

    const valueElement = compiled.querySelector('.card-body-content');
    expect(valueElement?.textContent).toContain('R$');
  });

  it('should render variation value', () => {
    fixture.componentRef.setInput('currency', {
      title: 'Libra',
      currentValue: 7.50,
      variation: '-0.5%',
      updated: '09:15'
    });
    fixture.detectChanges();

    const variationElement = compiled.querySelector('.card-footer-variation-value');
    expect(variationElement?.textContent).toBe('-0.5%');
  });

  it('should render updated time', () => {
    fixture.componentRef.setInput('currency', {
      title: 'Iene',
      currentValue: 0.05,
      variation: '+0.1%',
      updated: '14:45'
    });
    fixture.detectChanges();

    const updatedElement = compiled.querySelector('.card-footer-updated-value');
    expect(updatedElement?.textContent).toBe('14:45');
  });

  it('should apply text-red class when value is less than 1', () => {
    fixture.componentRef.setInput('currency', {
      title: 'Test Currency',
      currentValue: 0.50,
      variation: '+1%',
      updated: '08:00'
    });
    fixture.detectChanges();

    const valueElement = compiled.querySelector('.card-body-content');
    expect(valueElement?.classList.contains('text-red')).toBe(true);
  });

  it('should apply text-blue class when value is between 1 and 5', () => {
    fixture.componentRef.setInput('currency', {
      title: 'Test Currency',
      currentValue: 3.00,
      variation: '+1%',
      updated: '08:00'
    });
    fixture.detectChanges();

    const valueElement = compiled.querySelector('.card-body-content');
    expect(valueElement?.classList.contains('text-blue')).toBe(true);
  });

  it('should apply text-green class when value is greater than 5', () => {
    fixture.componentRef.setInput('currency', {
      title: 'Test Currency',
      currentValue: 7.50,
      variation: '+1%',
      updated: '08:00'
    });
    fixture.detectChanges();

    const valueElement = compiled.querySelector('.card-body-content');
    expect(valueElement?.classList.contains('text-green')).toBe(true);
  });

  it('should render default values when no input is provided', () => {
    fixture.detectChanges();

    const titleElement = compiled.querySelector('.card-header-title');
    expect(titleElement?.textContent).toBe('');
  });
});
