import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OLayout } from './o-layout';

describe('OLayout', () => {
  let component: OLayout;
  let fixture: ComponentFixture<OLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OLayout]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OLayout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
