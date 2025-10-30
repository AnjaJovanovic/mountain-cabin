import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OReservationVikendiceStatistika } from './o-reservation-vikendice-statistika';

describe('OReservationVikendiceStatistika', () => {
  let component: OReservationVikendiceStatistika;
  let fixture: ComponentFixture<OReservationVikendiceStatistika>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OReservationVikendiceStatistika]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OReservationVikendiceStatistika);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
