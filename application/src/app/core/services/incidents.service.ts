import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Subscription } from 'rxjs';
import { Incident } from '../models/incident.model';
import { environment } from '../../../environments/environment';
import { handleError } from '../utility/http-error-handler';

@Injectable({
  providedIn: 'root'
})
export class IncidentsService {
  public incidents$ = new BehaviorSubject<Incident[]>([]);

  private _incidentsSubscription?: Subscription;

  constructor(
    private http: HttpClient
  ) { }

  // DATA
  get incidents() {
    return this.incidents$.value;
  }
  set incidents(newIncidents: Incident[]) {
    this.incidents$.next(newIncidents);
  }

  // API
  loadIncidents() {
    console.log('Called loadIncidents');

    if (this._incidentsSubscription) {
      this._incidentsSubscription.unsubscribe();
    }
    const requestUrl = environment.api.incidents_url;
    this._incidentsSubscription = this.http.get<Incident[]>(requestUrl).pipe(
      catchError(handleError)
    ).subscribe((incidentsResponse) => {
      this.incidents$.next(incidentsResponse);
      console.log('Received incidents:', this.incidents);
    })
  }

}
