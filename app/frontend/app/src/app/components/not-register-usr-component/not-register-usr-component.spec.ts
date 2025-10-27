import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotRegisterUsrComponent } from './not-register-usr-component';

describe('NotRegisterUsrComponent', () => {
  let component: NotRegisterUsrComponent;
  let fixture: ComponentFixture<NotRegisterUsrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotRegisterUsrComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotRegisterUsrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
