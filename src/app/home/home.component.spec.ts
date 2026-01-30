import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { HomeComponent } from './home.component';
import { ConversionService } from '../service/conversion.service';
import { IQuote } from '../domain/quote';
import { CardComponent } from '../shared/components/card/card.component';
import { By } from '@angular/platform-browser';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let mockConversionService: any;
  let mockQuotes: IQuote[];

  beforeEach(async () => {
    mockQuotes = [
      { title: 'Dólar Canadense', code: 'CAD', currentValue: 3.85, variation: '1.2', updated: '10:30:00' },
      { title: 'Peso Argentino', code: 'ARS', currentValue: 0.05, variation: '-0.5', updated: '10:30:00' },
      { title: 'Libra Esterlina', code: 'GBP', currentValue: 6.25, variation: '0.8', updated: '10:30:00' }
    ];

    mockConversionService = {
      startGetConversionRates: vi.fn(),
      stopGetConversionRates: vi.fn(),
      forceRefresh: vi.fn(),
      quotes: signal<IQuote[]>(mockQuotes),
      loading: signal(false),
      error: signal<string | null>(null)
    };

    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        { provide: ConversionService, useValue: mockConversionService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should match snapshot', () => {
    expect(fixture.nativeElement).toMatchSnapshot();
  });

  describe('Lifecycle Hooks', () => {
    it('should call startGetConversionRates on ngOnInit', () => {
      component.ngOnInit();
      expect(mockConversionService.startGetConversionRates).toHaveBeenCalled();
    });

    it('should call stopGetConversionRates on ngOnDestroy', () => {
      component.ngOnDestroy();
      expect(mockConversionService.stopGetConversionRates).toHaveBeenCalled();
    });
  });

  describe('reload method', () => {
    it('should call forceRefresh when reload is called', () => {
      component.reload();
      expect(mockConversionService.forceRefresh).toHaveBeenCalled();
    });
  });

  describe('Service Integration', () => {
    it('should inject ConversionService', () => {
      expect(component.conversionService).toBe(mockConversionService);
    });

    it('should expose quotes signal from service', () => {
      expect(component.quotes()).toEqual(mockQuotes);
    });

    it('should expose loading signal from service', () => {
      expect(component.loading()).toBe(false);
    });

    it('should expose error signal from service', () => {
      expect(component.error()).toBe(null);
    });
  });

  describe('Template Rendering', () => {
    it('should render card components for each quote', () => {
      fixture.detectChanges();
      const cards = fixture.debugElement.queryAll(By.directive(CardComponent));
      expect(cards.length).toBe(mockQuotes.length);
    });

    it('should pass currency input to card components', () => {
      fixture.detectChanges();
      const cards = fixture.debugElement.queryAll(By.directive(CardComponent));

      cards.forEach((card, index) => {
        const cardComponent = card.componentInstance as CardComponent;
        expect(cardComponent.currency()).toEqual(mockQuotes[index]);
      });
    });

    it('should pass loading state to card components', () => {
      mockConversionService.loading.set(true);
      fixture.detectChanges();

      const cards = fixture.debugElement.queryAll(By.directive(CardComponent));
      cards.forEach(card => {
        const cardComponent = card.componentInstance as CardComponent;
        expect(cardComponent.loading()).toBe(true);
      });
    });

    it('should pass error state to card components', () => {
      const errorMessage = 'Algo deu errado.';
      mockConversionService.error.set(errorMessage);
      fixture.detectChanges();

      const cards = fixture.debugElement.queryAll(By.directive(CardComponent));
      cards.forEach(card => {
        const cardComponent = card.componentInstance as CardComponent;
        expect(cardComponent.error()).toBe(errorMessage);
      });
    });

    it('should call reload when card emits reloadRequest event', () => {
      const reloadSpy = vi.spyOn(component, 'reload');
      fixture.detectChanges();

      const card = fixture.debugElement.query(By.directive(CardComponent));
      const cardComponent = card.componentInstance as CardComponent;

      cardComponent.reloadRequest.emit();

      expect(reloadSpy).toHaveBeenCalled();
    });

    it('should render empty when quotes array is empty', () => {
      mockConversionService.quotes.set([]);
      fixture.detectChanges();

      const cards = fixture.debugElement.queryAll(By.directive(CardComponent));
      expect(cards.length).toBe(0);
    });
  });
});
