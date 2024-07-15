import { Component, Input } from '@angular/core';
import { Device } from '../../../../core/models/device.model';
import { Incident } from '../../../../core/models/incident.model';
import { Image } from '../../../../core/models/image.model';

@Component({
  selector: 'app-selected-incident',
  standalone: true,
  imports: [],
  templateUrl: './selected-incident.component.html',
  styleUrl: './selected-incident.component.css'
})
export class SelectedIncidentComponent {
  @Input() incident: {incident: Incident, images: Image[], device: Device | undefined} | undefined;

}
