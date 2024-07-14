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

@Component({
  selector: 'app-devices',
  standalone: true,
  imports: [CardComponent, NgClass, MatIconModule, DevicesAddComponent],
  templateUrl: './devices.component.html',
  styleUrl: './devices.component.css'
})
export class DevicesComponent implements OnInit, OnDestroy {
  private destroyed$ = new Subject<void>();
  public devicesData: {device: Device, incidents: Incident[]}[] = [];

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
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  onAddDevice(device: Device) {
    this.deviceService.addDevice(device);
  }

  deleteDevice(deviceID: string) {
    this.deviceService.deleteDevice(deviceID);
  }

  connectDevice(deviceID: string) {
    this.deviceService.connectToDevice(deviceID);
  }

}
