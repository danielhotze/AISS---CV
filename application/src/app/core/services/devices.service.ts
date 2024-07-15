import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Subscription } from 'rxjs';
import { Device } from '../models/device.model';
import { environment } from '../../../environments/environment';
import { ErrorHandlerService } from './error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class DevicesService {
  public devices$ = new BehaviorSubject<Device[]>([]);
  public selectedDeviceID$ = new BehaviorSubject<string | undefined>(undefined);

  private _devicesSubscription?: Subscription;
  private _connectSubscription?: Subscription;
  private _addDeviceSubscription?: Subscription;
  private _updateDeviceSubscription?: Subscription;
  private _deleteDeviceSubscription?: Subscription;

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  // DATA
  get devices(): Device[] {
    return this.devices$.value;
  }
  set devices(newDevices: Device[]) {
    this.devices$.next(newDevices);
  }

  get selectedDeviceID() {
    return this.selectedDeviceID$.value;
  }
  set selectedDeviceID(deviceID: string | undefined) {
    this.selectedDeviceID$.next(deviceID);
  }

  // API
  loadDevices() {
    if (this._devicesSubscription) {
      this._devicesSubscription.unsubscribe();
    }
    const requestUrl = environment.api.devices_url;
    this._devicesSubscription = this.http.get<Device[]>(requestUrl).pipe(
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error, 'An error occured while loading the devices.'))
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
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error, 'Something went wrong trying to delete the device.'))
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
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error, 'Something went wrong when trying to add the device.'))
    ).subscribe((addResponse) => {
      console.log(addResponse);
      this.loadDevices();
    });
  }

  updateDevice(device: Device) {
    if (this._updateDeviceSubscription) {
      this._updateDeviceSubscription.unsubscribe();
    }
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const requestUrl = `${environment.api.devices_url}/${device.id}`;
    this._updateDeviceSubscription = this.http.put<Device>(requestUrl, device, {headers}).pipe(
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error, 'Something went wrong when trying to update the device.'))
    ).subscribe((updateResponse) => {
      console.log(updateResponse);
      this.loadDevices();
    });
  }

  connectToDevice(deviceId: string) {
    if (this._connectSubscription) {
      this._connectSubscription.unsubscribe();
    }
    const requestUrl = environment.api.device_connect_url(deviceId);
    this._connectSubscription = this.http.get(requestUrl).pipe(
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error, 'Connection to device was unsuccessful.'))
    ).subscribe((connectResponse: any) => {
      if (connectResponse.message) {
        console.log(connectResponse.message);
        this.loadDevices();
      }
    });
  }
}
