import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegistroPage } from './registro.page';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('RegistroPage', () => {
  let component: RegistroPage;
  let fixture: ComponentFixture<RegistroPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistroPage],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({}) // Simula parámetros de ruta vacíos
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegistroPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

