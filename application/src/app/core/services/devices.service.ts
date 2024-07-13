import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Subscription } from 'rxjs';
import { Device } from '../models/device.model';
import { environment } from '../../../environments/environment';
import { handleError } from '../utility/http-error-handler';

@Injectable({
  providedIn: 'root'
})
export class DevicesService {
  public devices$ = new BehaviorSubject<Device[]>([]);
  public selectedDevice$ = new BehaviorSubject<string>('');

  private _devicesSubscription?: Subscription;
  private _connectSubscription?: Subscription;
  private _addDeviceSubscription?: Subscription;
  private _deleteDeviceSubscription?: Subscription;

  constructor(
    private http: HttpClient
  ) { }

  // DATA
  get devices(): Device[] {
    return this.devices$.value;
  }
  set devices(newDevices: Device[]) {
    this.devices$.next(newDevices);
  }

  get selectedDeviceID() {
    return this.selectedDevice$.value;
  }
  set selectedDeviceID(deviceID: string) {
    this.selectedDevice$.next(deviceID);
  }

  // API
  loadDevices() {
    if (this._devicesSubscription) {
      this._devicesSubscription.unsubscribe();
    }
    const requestUrl = environment.api.devices_url;
    this._devicesSubscription = this.http.get<Device[]>(requestUrl).pipe(
      catchError(handleError)
    ).subscribe((deviceResponse) => {
      this.devices$.next(deviceResponse);
      console.log('Received devices:', this.devices);
    })
  }

  deleteDevice(deviceId: string) {
    if (this._deleteDeviceSubscription) {
      this._deleteDeviceSubscription.unsubscribe();
    }
    const requestUrl = `${environment.api.devices_url}/${deviceId}`;
    this._deleteDeviceSubscription = this.http.delete(requestUrl).pipe(
      catchError(handleError)
    ).subscribe((deleteResponse: any) => {
      if (deleteResponse.message) {
        console.log(deleteResponse.message);
      }
      this.loadDevices();
    })
  }

  addDevice(device: Device) {
    if (this._addDeviceSubscription) {
      this._addDeviceSubscription.unsubscribe();
    }
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const requestUrl = environment.api.devices_url;
    this._addDeviceSubscription = this.http.post<Device>(requestUrl, device, {headers}).pipe(
      catchError(handleError)
    ).subscribe((addResponse) => {
      console.log(addResponse);
      this.loadDevices();
    })
  }

  connectToDevice(deviceId: string) {
    if (this._connectSubscription) {
      this._connectSubscription.unsubscribe();
    }
    const requestUrl = environment.api.device_connect_url(deviceId);
    this._connectSubscription = this.http.get(requestUrl).pipe(
      catchError(handleError)
    ).subscribe((connectResponse: any) => {
      if (connectResponse.message) {
        console.log(connectResponse.message);
        this.loadDevices();
      }
    });
  }
}
