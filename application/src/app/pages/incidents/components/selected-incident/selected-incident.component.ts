import { Component, Input } from '@angular/core';
import { Device } from '../../../../core/models/device.model';
import { Incident } from '../../../../core/models/incident.model';
import { Image } from '../../../../core/models/image.model';
import { MatIconModule } from '@angular/material/icon';
import { NgClass } from '@angular/common';
import { formatDateTime } from '../../../../core/utility/date-format.util';

// refer to server.js for the image path
export const IMAGE_FOLDER_URL = '/PPE-Detection_uploads/';

@Component({
  selector: 'app-selected-incident',
  standalone: true,
  imports: [MatIconModule, NgClass],
  templateUrl: './selected-incident.component.html',
  styleUrl: './selected-incident.component.css'
})
export class SelectedIncidentComponent {
  @Input() selected: {incident: Incident, images: Image[], device: Device | undefined} | undefined;
  public imageIndex = 0;
  public image_folder = IMAGE_FOLDER_URL;

  nextImage() {
    if (this.imageIndex === (this.selected!.images.length - 1)) {
      this.imageIndex = 0;
      return;
    }
    this.imageIndex++;
  }

  prevImage() {
    if (this.imageIndex === 0) {
      this.imageIndex = this.selected!.images.length - 1;
      return;
    }
    this.imageIndex--;
  }

  format(date: Date): string {
    return formatDateTime(date);
  }
}
