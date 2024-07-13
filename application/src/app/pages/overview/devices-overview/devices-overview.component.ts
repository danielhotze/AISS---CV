import { Component, OnDestroy, OnInit } from '@angular/core';
import { DevicesService } from '../../../core/services/devices.service';
import { Subject, takeUntil } from 'rxjs';
import { Device } from '../../../core/models/device.model';
import { NgClass } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-devices-overview',
  standalone: true,
  imports: [NgClass],
  templateUrl: './devices-overview.component.html',
  styleUrl: './devices-overview.component.css'
})
export class DevicesOverviewComponent implements OnInit, OnDestroy {
  private destroyed$ = new Subject<void>();
  public devices: Device[] = [];

  constructor(
    private deviceService: DevicesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.deviceService.devices$.pipe(
      takeUntil(this.destroyed$)
    ).subscribe(devices => this.devices = devices);
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  selectDeviceAndNavigate(deviceID: string) {
    this.deviceService.selectedDeviceID = deviceID;
    this.router.navigateByUrl('/devices');
  }

}
