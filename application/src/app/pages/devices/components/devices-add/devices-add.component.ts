import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Device } from '../../../../core/models/device.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-devices-add',
  standalone: true,
  imports: [MatIconModule, FormsModule],
  templateUrl: './devices-add.component.html',
  styleUrl: './devices-add.component.css'
})
export class DevicesAddComponent {
  @Input() newDevice: Device = this.generateDeviceSkeleton();
  @Output() addDevice: EventEmitter<Device> = new EventEmitter();
  public isValid = this.checkValidity();

  private generateDeviceSkeleton(): Device {
    return {
      id: crypto.randomUUID(),
      ip: '',
      name: '',
      location: '',
      status: 'Inactive'
    }
  }

  private checkValidity(): boolean {
    const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    const ipv6Pattern = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    if (!ipv4Pattern.test(this.newDevice.ip) && !ipv6Pattern.test(this.newDevice.ip)) {
      this.isValid = false;
      return false;
    }
    if (!(this.newDevice.name.length > 0) || !(this.newDevice.location.length > 0)) {
      this.isValid = false;
      return false;
    }
    this.isValid = true;
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

}
