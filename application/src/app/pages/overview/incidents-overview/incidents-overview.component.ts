import { Component, OnDestroy, OnInit } from '@angular/core';
import { IncidentsService } from '../../../core/services/incidents.service';
import { Subject, takeUntil } from 'rxjs';
import { Incident } from '../../../core/models/incident.model';
import { Router } from '@angular/router';
import { formatDateTime } from '../../../core/utility/date-format.util';

@Component({
  selector: 'app-incidents-overview',
  standalone: true,
  imports: [],
  templateUrl: './incidents-overview.component.html',
  styleUrl: './incidents-overview.component.css'
})
export class IncidentsOverviewComponent implements OnInit, OnDestroy {
  private destroyed$ = new Subject<void>();
  public incidents: Incident[] = [];

  constructor(
    private incidentService: IncidentsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.incidentService.incidents$.pipe(
      takeUntil(this.destroyed$)
    ).subscribe((incidents) => {
      this.incidents = incidents;
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  selectIncidentAndNavigate(incidentID: string) {
    this.incidentService.selectedIncident = incidentID;
    this.router.navigateByUrl('/incidents');
  }

  format(date: Date): string {
    return formatDateTime(date);
  }
}
