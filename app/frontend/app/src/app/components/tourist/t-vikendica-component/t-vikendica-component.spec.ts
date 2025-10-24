import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TVikendicaComponent } from './t-vikendica-component';

describe('TVikendicaComponent', () => {
  let component: TVikendicaComponent;
  let fixture: ComponentFixture<TVikendicaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TVikendicaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TVikendicaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
