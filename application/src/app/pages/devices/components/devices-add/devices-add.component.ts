import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Device } from '../../../../core/models/device.model';
import { FormsModule } from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import { DevicesService } from '../../../../core/services/devices.service';

@Component({
  selector: 'app-devices-add',
  standalone: true,
  imports: [MatIconModule, FormsModule, MatFormFieldModule, MatInputModule],
  templateUrl: './devices-add.component.html',
  styleUrl: './devices-add.component.css'
})
export class DevicesAddComponent {
  @Input() newDevice: Device = this.generateDeviceSkeleton();
  @Output() addDevice: EventEmitter<Device> = new EventEmitter();
  public validationError = '';

  constructor(
    private deviceService: DevicesService
  ) {}

  private generateDeviceSkeleton(): Device {
    return {
      id: crypto.randomUUID(),
      ip: '',
      name: '',
      location: '',
      status: 'Active'
    }
  }

  private checkValidity(): boolean {
    const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    const ipv6Pattern = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    if (!ipv4Pattern.test(this.newDevice.ip) && !ipv6Pattern.test(this.newDevice.ip)) {
      this.validationError = 'Device IP is not in valid ipv4/ipv6 format.';
      return false;
    }
    if (this.deviceService.devices.find(d => d.ip === this.newDevice.ip)) {
      this.validationError = 'A device with this IP address already exists.';
      return false;
    }
    if (this.deviceService.devices.find(d => d.name === this.newDevice.name)) {
      this.validationError = 'A device with this name already exists.';
      return false;
    }
    if (!(this.newDevice.name.length > 0)) {
      this.validationError = 'Device needs a name.';
      return false;
    }
    if (!(this.newDevice.location.length > 0)) {
      this.validationError = 'Device needs a location.';
      return false;
    }
    this.validationError = '';
    return true;
  }

  public validateAndAddDevice() {
    if (!this.checkValidity()) {
      console.log('Cannot add device. Invalid device data.');
      return;
    }
    this.addDevice.emit({...this.newDevice});
    this.newDevice = this.generateDeviceSkeleton();
  }

  public resetNewDevice() {
    this.newDevice = this.generateDeviceSkeleton();
  }

}
