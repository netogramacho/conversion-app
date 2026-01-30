import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CardComponent } from './card.component';

describe('CardComponent', () => {
  let component: CardComponent;
  let fixture: ComponentFixture<CardComponent>;
  let compiled: HTMLElement;

  const mockCurrency = {
    title: 'Dólar Americano',
    currentValue: 5.25,
    variation: '+1.5%',
    updated: '10:00'
  };

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

  it('should match snapshot', () => {
    expect(compiled).toMatchSnapshot();
  });

  describe('Rendering normal state', () => {
    it('should render currency title', () => {
      fixture.componentRef.setInput('currency', mockCurrency);
      fixture.detectChanges();

      const titleElement = compiled.querySelector('.card-header-title');
      expect(titleElement?.textContent).toBe('Dólar Americano');
    });

    it('should render currency value with BRL format', () => {
      fixture.componentRef.setInput('currency', mockCurrency);
      fixture.detectChanges();

      const valueElement = compiled.querySelector('.card-body-content');
      expect(valueElement?.textContent).toContain('R$');
    });

    it('should render variation value', () => {
      fixture.componentRef.setInput('currency', mockCurrency);
      fixture.detectChanges();

      const variationElement = compiled.querySelector('.card-footer-variation-value');
      expect(variationElement?.textContent).toBe('+1.5%');
    });

    it('should render updated time', () => {
      fixture.componentRef.setInput('currency', mockCurrency);
      fixture.detectChanges();

      const updatedElement = compiled.querySelector('.card-footer-updated-value');
      expect(updatedElement?.textContent).toBe('10:00');
    });
  });

  describe('Color classes based on value', () => {
    it('should apply text-red class when value is less than or equal to 1', () => {
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

    it('should apply text-red class when value is exactly 1', () => {
      fixture.componentRef.setInput('currency', {
        title: 'Test Currency',
        currentValue: 1.00,
        variation: '+1%',
        updated: '08:00'
      });
      fixture.detectChanges();

      const valueElement = compiled.querySelector('.card-body-content');
      expect(valueElement?.classList.contains('text-red')).toBe(true);
    });

    it('should apply text-green class when value is between 1 and 5', () => {
      fixture.componentRef.setInput('currency', {
        title: 'Test Currency',
        currentValue: 3.00,
        variation: '+1%',
        updated: '08:00'
      });
      fixture.detectChanges();

      const valueElement = compiled.querySelector('.card-body-content');
      expect(valueElement?.classList.contains('text-green')).toBe(true);
    });

    it('should apply text-blue class when value is greater than 5', () => {
      fixture.componentRef.setInput('currency', {
        title: 'Test Currency',
        currentValue: 7.50,
        variation: '+1%',
        updated: '08:00'
      });
      fixture.detectChanges();

      const valueElement = compiled.querySelector('.card-body-content');
      expect(valueElement?.classList.contains('text-blue')).toBe(true);
    });
  });

  describe('Loading state', () => {
    it('should render loader when loading is true', () => {
      fixture.componentRef.setInput('currency', mockCurrency);
      fixture.componentRef.setInput('loading', true);
      fixture.detectChanges();

      const loader = compiled.querySelector('.card-loader');
      expect(loader).toBeTruthy();
    });

    it('should render spinner image with proper attributes when loading', () => {
      fixture.componentRef.setInput('currency', mockCurrency);
      fixture.componentRef.setInput('loading', true);
      fixture.detectChanges();

      const spinner = compiled.querySelector('.card-loader-spinner') as HTMLImageElement;
      expect(spinner).toBeTruthy();
      expect(spinner?.getAttribute('src')).toBe('loader.svg');
      expect(spinner?.getAttribute('alt')).toBe('Carregando cotação');
      expect(spinner?.getAttribute('role')).toBe('status');
    });

    it('should not render card body when loading', () => {
      fixture.componentRef.setInput('currency', mockCurrency);
      fixture.componentRef.setInput('loading', true);
      fixture.detectChanges();

      const cardBody = compiled.querySelector('.card-body');
      expect(cardBody).toBeFalsy();
    });

    it('should not render card footer when loading', () => {
      fixture.componentRef.setInput('currency', mockCurrency);
      fixture.componentRef.setInput('loading', true);
      fixture.detectChanges();

      const cardFooter = compiled.querySelector('.card-footer');
      expect(cardFooter).toBeFalsy();
    });
  });

  describe('Error state', () => {
    it('should render error message when error is provided', () => {
      fixture.componentRef.setInput('currency', mockCurrency);
      fixture.componentRef.setInput('error', 'Erro ao carregar cotação');
      fixture.detectChanges();

      const errorMessage = compiled.querySelector('.card-error-message');
      expect(errorMessage?.textContent).toBe('Erro ao carregar cotação');
    });

    it('should render reload button when error is provided', () => {
      fixture.componentRef.setInput('currency', mockCurrency);
      fixture.componentRef.setInput('error', 'Erro ao carregar cotação');
      fixture.detectChanges();

      const reloadButton = compiled.querySelector('.card-error-reload-button');
      expect(reloadButton).toBeTruthy();
      expect(reloadButton?.getAttribute('aria-label')).toBe('Recarregar cotação');
    });

    it('should not render card body when error is present', () => {
      fixture.componentRef.setInput('currency', mockCurrency);
      fixture.componentRef.setInput('error', 'Erro ao carregar cotação');
      fixture.detectChanges();

      const cardBody = compiled.querySelector('.card-body');
      expect(cardBody).toBeFalsy();
    });

    it('should emit reloadRequest when reload button is clicked', () => {
      fixture.componentRef.setInput('currency', mockCurrency);
      fixture.componentRef.setInput('error', 'Erro ao carregar cotação');
      fixture.detectChanges();

      let emitted = false;
      component.reloadRequest.subscribe(() => emitted = true);

      const reloadButton = compiled.querySelector('.card-error-reload-button') as HTMLButtonElement;
      reloadButton.click();

      expect(emitted).toBe(true);
    });
  });

  describe('Accessibility', () => {
    it('should set aria-label with value description', () => {
      fixture.componentRef.setInput('currency', {
        title: 'Test Currency',
        currentValue: 3.50,
        variation: '+1%',
        updated: '08:00'
      });
      fixture.detectChanges();

      const valueElement = compiled.querySelector('.card-body-content');
      expect(valueElement?.getAttribute('aria-label')).toBe('Valor médio: 3.5');
    });
  });

  describe('getValueDescription method', () => {
    it('should return "Valor indisponível" when currentValue is null', () => {
      fixture.componentRef.setInput('currency', {
        title: 'Test',
        currentValue: null as any,
        variation: '+1%',
        updated: '08:00'
      });

      expect(component.getValueDescription()).toBe('Valor indisponível');
    });

    it('should return "Valor baixo" when value is less than or equal to 1', () => {
      fixture.componentRef.setInput('currency', {
        title: 'Test',
        currentValue: 0.75,
        variation: '+1%',
        updated: '08:00'
      });

      expect(component.getValueDescription()).toBe('Valor baixo: 0.75');
    });

    it('should return "Valor médio" when value is between 1 and 5', () => {
      fixture.componentRef.setInput('currency', {
        title: 'Test',
        currentValue: 3.25,
        variation: '+1%',
        updated: '08:00'
      });

      expect(component.getValueDescription()).toBe('Valor médio: 3.25');
    });

    it('should return "Valor alto" when value is greater than 5', () => {
      fixture.componentRef.setInput('currency', {
        title: 'Test',
        currentValue: 8.50,
        variation: '+1%',
        updated: '08:00'
      });

      expect(component.getValueDescription()).toBe('Valor alto: 8.5');
    });
  });
});

