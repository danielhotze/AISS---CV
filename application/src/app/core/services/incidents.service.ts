import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, of, ReplaySubject, Subscription } from 'rxjs';
import { Incident } from '../models/incident.model';
import { environment } from '../../../environments/environment';
import { handleError } from '../utility/http-error-handler';

@Injectable({
  providedIn: 'root'
})
export class IncidentsService {
  public incidents$: ReplaySubject<Incident[]> = new ReplaySubject(1);
  private _incidents: Incident[] = [];

  private _incidentsSubscription?: Subscription;

  constructor(
    private http: HttpClient
  ) { }

  // DATA
  get incidents() {
    return this._incidents;
  }
  set incidents(newIncidents: Incident[]) {
    this._incidents = newIncidents;
    this.incidents$.next(this._incidents);
  }

  // API
  loadIncidents() {
    if (this._incidentsSubscription) {
      this._incidentsSubscription.unsubscribe();
    }
    const requestUrl = environment.api.incidents_url;
    this._incidentsSubscription = this.http.get<Incident[]>(requestUrl).pipe(
      catchError(handleError)
    ).subscribe((incidentsResponse) => {
      this.incidents = incidentsResponse;
      console.log('Received incidents:', this.incidents);
    })
  }

}
