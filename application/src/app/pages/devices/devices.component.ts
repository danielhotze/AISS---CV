import { Component, OnDestroy, OnInit } from '@angular/core';
import { DevicesService } from '../../core/services/devices.service';
import { Device } from '../../core/models/device.model';
import { combineLatest, Subject, takeUntil } from 'rxjs';
import { IncidentsService } from '../../core/services/incidents.service';
import { Incident } from '../../core/models/incident.model';
import { CardComponent } from "../../shared/card/card.component";
import { NgClass } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { DevicesAddComponent } from "./components/devices-add/devices-add.component";
import { DevicesEditComponent } from "./components/devices-edit/devices-edit.component";

@Component({
  selector: 'app-devices',
  standalone: true,
  imports: [CardComponent, NgClass, MatIconModule, DevicesAddComponent, DevicesEditComponent],
  templateUrl: './devices.component.html',
  styleUrl: './devices.component.css'
})
export class DevicesComponent implements OnInit, OnDestroy {
  private destroyed$ = new Subject<void>();
  public devicesData: {device: Device, incidents: Incident[]}[] = [];
  public editDevice: Device | undefined = undefined;

  constructor(
    private deviceService: DevicesService,
    private incidentService: IncidentsService
  ) {}

  ngOnInit(): void {
    combineLatest([
      this.deviceService.devices$,
      this.incidentService.incidents$
    ]).pipe(
      takeUntil(this.destroyed$)
    ).subscribe(([devices, incidents]) => {
      this.devicesData = [];
      devices.forEach((device) => {
        const deviceIncidents = incidents.filter((incident) => incident.deviceID === device.id);
        this.devicesData.push({device, incidents: deviceIncidents});
      })
    });

    this.deviceService.selectedDeviceID$.pipe(
      takeUntil(this.destroyed$)
    ).subscribe((deviceID) => {
      this.editDevice = this.deviceService.devices.find(d => d.id === deviceID);
      if (this.editDevice !== undefined) {
        this.editDevice = {...this.editDevice}
      }
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  onAddDevice(device: Device) {
    this.deviceService.addDevice(device);
  }

  deleteDevice(deviceID: string) {
    if (confirm(`You are about to delete the device ${this.deviceService.devices.find(d => d.id === deviceID)!.name}`)) {
      this.deviceService.deleteDevice(deviceID);
    }
  }

  connectDevice(deviceID: string) {
    this.deviceService.connectToDevice(deviceID);
  }

  selectDevice(deviceID: string) {
    this.deviceService.selectedDeviceID = deviceID;
  }

  closeEdit() {
    this.deviceService.selectedDeviceID = undefined;
  }

  edit(device: Device) {
    this.deviceService.updateDevice({...device});
    this.deviceService.selectedDeviceID = undefined;
  }

}
