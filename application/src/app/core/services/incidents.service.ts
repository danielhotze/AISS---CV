import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Subscription } from 'rxjs';
import { Incident } from '../models/incident.model';
import { environment } from '../../../environments/environment';
import { ErrorHandlerService } from './error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class IncidentsService {
  public incidents$ = new BehaviorSubject<Incident[]>([]);
  public selectedIncident$ = new BehaviorSubject<string>('');

  private _incidentsSubscription?: Subscription;

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  // DATA
  get incidents() {
    return this.incidents$.value;
  }
  set incidents(newIncidents: Incident[]) {
    this.incidents$.next(newIncidents);
  }

  get selectedIncident() {
    return this.selectedIncident$.value;
  }
  set selectedIncident(incidentID: string) {
    this.selectedIncident$.next(incidentID);
  }

  // API
  loadIncidents() {
    console.log('Called loadIncidents');

    if (this._incidentsSubscription) {
      this._incidentsSubscription.unsubscribe();
    }
    const requestUrl = environment.api.incidents_url;
    this._incidentsSubscription = this.http.get<Incident[]>(requestUrl).pipe(
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error, 'An error occured while trying to load incident data.'))
    ).subscribe((incidentsResponse) => {
      incidentsResponse.forEach(incident => {
        incident.timestamp_start = new Date(incident.timestamp_start);
        incident.timestamp_end = new Date(incident.timestamp_end);
      });
      incidentsResponse.sort((a, b) => b.timestamp_start.getTime() - a.timestamp_start.getTime());

      this.incidents$.next(incidentsResponse);
      console.log('Received incidents:', this.incidents);
    })
  }

}
