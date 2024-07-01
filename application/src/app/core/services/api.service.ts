import { Injectable } from '@angular/core';
import { DevicesService } from './devices.service';
import { Device } from '../models/device.model';
import { ImagesService } from './images.service';
import { IncidentsService } from './incidents.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(
    private devicesService: DevicesService,
    private imagesService: ImagesService,
    private incidentService: IncidentsService
  ) { }

  // DEVICES
  requestDevices() {
    this.devicesService.loadDevices();
  }
  createDevice(device: Device) {
    this.devicesService.addDevice(device);
  }
  deleteDevice(deviceId: string) {
    this.devicesService.deleteDevice(deviceId);
  }
  connectDevice(deviceId: string) {
    this.devicesService.connectToDevice(deviceId);
  }

  // INCIDENTS
  requestIncidents() {
    this.incidentService.loadIncidents();
  }

  // IMAGES
  requestImages() {
    this.imagesService.loadImages();
  }
}
