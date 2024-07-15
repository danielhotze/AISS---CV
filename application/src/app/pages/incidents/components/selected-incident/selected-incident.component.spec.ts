import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectedIncidentComponent } from './selected-incident.component';

describe('SelectedIncidentComponent', () => {
  let component: SelectedIncidentComponent;
  let fixture: ComponentFixture<SelectedIncidentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectedIncidentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectedIncidentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
