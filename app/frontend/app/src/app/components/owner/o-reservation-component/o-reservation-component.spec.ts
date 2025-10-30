import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OReservationComponent } from './o-reservation-component';

describe('OReservationComponent', () => {
  let component: OReservationComponent;
  let fixture: ComponentFixture<OReservationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OReservationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OReservationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
