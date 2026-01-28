import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let compiled: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    compiled = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render header container', () => {
    const headerElement = compiled.querySelector('.header');
    expect(headerElement).toBeTruthy();
  });

  it('should render logo image', () => {
    const logoElement = compiled.querySelector('.header-logo');
    expect(logoElement).toBeTruthy();
  });

  it('should have correct logo source', () => {
    const logoElement = compiled.querySelector('.header-logo') as HTMLImageElement;
    expect(logoElement?.getAttribute('src')).toBe('logo.svg');
  });

  it('should have alt text for accessibility', () => {
    const logoElement = compiled.querySelector('.header-logo') as HTMLImageElement;
    expect(logoElement?.getAttribute('alt')).toBe('Logo');
  });

  it('should apply correct CSS class to logo', () => {
    const logoElement = compiled.querySelector('img');
    expect(logoElement?.classList.contains('header-logo')).toBe(true);
  });
});
