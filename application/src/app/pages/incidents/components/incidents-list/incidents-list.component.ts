import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Incident } from '../../../../core/models/incident.model';
import { Device } from '../../../../core/models/device.model';
import { Image } from '../../../../core/models/image.model';

@Component({
  selector: 'app-incidents-list',
  standalone: true,
  imports: [],
  templateUrl: './incidents-list.component.html',
  styleUrl: './incidents-list.component.css'
})
export class IncidentsListComponent {
  @Input() incidents: {incident: Incident, images: Image[], device: Device | undefined}[];

  @Output() select: EventEmitter<string> = new EventEmitter();

}
