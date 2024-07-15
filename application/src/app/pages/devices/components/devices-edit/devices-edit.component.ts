import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { Device } from '../../../../core/models/device.model';
import { FormsModule } from '@angular/forms';
import { DevicesService } from '../../../../core/services/devices.service';

@Component({
  selector: 'app-devices-edit',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './devices-edit.component.html',
  styleUrl: './devices-edit.component.css'
})
export class DevicesEditComponent {
  @Input() device: Device;
  public validationError = '';

  @Output() close: EventEmitter<void> = new EventEmitter();
  @Output() edit: EventEmitter<Device> = new EventEmitter();

  constructor(
    private deviceService: DevicesService
  ) {}

  @HostListener('click',['$event'])
  onClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.close.emit();
    }
  }

  private checkValidity(device: Device): boolean {
    const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    const ipv6Pattern = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    if (!ipv4Pattern.test(device.ip) && !ipv6Pattern.test(device.ip)) {
      this.validationError = 'Device IP is not in valid ipv4/ipv6 format.';
      return false;
    }
    const ipDevice = this.deviceService.devices.find(d => d.ip === device.ip)
    if (ipDevice && ipDevice.id !== device.id) {
      this.validationError = 'A device with this IP address already exists.';
      return false;
    }
    const nameDevice = this.deviceService.devices.find(d => d.name === device.name)
    if (nameDevice && nameDevice.id !== device.id) {
      this.validationError = 'A device with this name already exists.';
      return false;
    }
    if (!(device.name.length > 0)) {
      this.validationError = 'Device needs a name.';
      return false;
    }
    if (!(device.location.length > 0)) {
      this.validationError = 'Device needs a location.';
      return false;
    }
    this.validationError = '';
    return true;
  }

  validateEdit() {
    if (this.checkValidity(this.device)) {
      this.edit.emit(this.device)
    }
  }

}
