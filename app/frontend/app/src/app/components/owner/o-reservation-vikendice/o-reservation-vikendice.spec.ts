import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OReservationVikendice } from './o-reservation-vikendice';

describe('OReservationVikendice', () => {
  let component: OReservationVikendice;
  let fixture: ComponentFixture<OReservationVikendice>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OReservationVikendice]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OReservationVikendice);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
