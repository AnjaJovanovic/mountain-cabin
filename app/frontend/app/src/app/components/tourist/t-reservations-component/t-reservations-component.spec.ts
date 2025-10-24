import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TReservationsComponent } from './t-reservations-component';

describe('TReservationsComponent', () => {
  let component: TReservationsComponent;
  let fixture: ComponentFixture<TReservationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TReservationsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TReservationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
