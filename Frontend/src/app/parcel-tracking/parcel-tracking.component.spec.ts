import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParcelTrackingComponent } from './parcel-tracking.component';

describe('ParcelTrackingComponent', () => {
  let component: ParcelTrackingComponent;
  let fixture: ComponentFixture<ParcelTrackingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParcelTrackingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ParcelTrackingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
