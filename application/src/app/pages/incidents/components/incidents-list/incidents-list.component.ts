import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Incident } from '../../../../core/models/incident.model';
import { Device } from '../../../../core/models/device.model';
import { Image } from '../../../../core/models/image.model';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-incidents-list',
  standalone: true,
  imports: [NgClass],
  templateUrl: './incidents-list.component.html',
  styleUrl: './incidents-list.component.css'
})
export class IncidentsListComponent {
  @Input() incidents: {incident: Incident, images: Image[], device: Device | undefined}[];
  @Input() selectedIncident: string | undefined;

  @Output() select: EventEmitter<string> = new EventEmitter();

}
