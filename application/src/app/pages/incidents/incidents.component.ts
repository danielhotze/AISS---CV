import { Component, OnDestroy, OnInit } from '@angular/core';
import { SelectedIncidentComponent } from "./components/selected-incident/selected-incident.component";
import { IncidentsListComponent } from "./components/incidents-list/incidents-list.component";
import { combineLatest, Subject, takeUntil } from 'rxjs';
import { DevicesService } from '../../core/services/devices.service';
import { IncidentsService } from '../../core/services/incidents.service';
import { Device } from '../../core/models/device.model';
import { Incident } from '../../core/models/incident.model';
import { Image } from '../../core/models/image.model';
import { ImagesService } from '../../core/services/images.service';

@Component({
  selector: 'app-incidents',
  standalone: true,
  imports: [SelectedIncidentComponent, IncidentsListComponent],
  templateUrl: './incidents.component.html',
  styleUrl: './incidents.component.css'
})
export class IncidentsComponent implements OnInit, OnDestroy {
  private destroyed$ = new Subject<void>();
  public incidentData:  {incident: Incident, images: Image[], device: Device | undefined}[];
  public selectedIncident: {incident: Incident, images: Image[], device: Device | undefined} | undefined;

  constructor(
    private deviceService: DevicesService,
    private incidentService: IncidentsService,
    private imageService: ImagesService
  ) {}

  ngOnInit(): void {
    combineLatest([
      this.deviceService.devices$,
      this.incidentService.incidents$,
      this.incidentService.selectedIncident$,
      this.imageService.imageData$
    ]).pipe(
      takeUntil(this.destroyed$)
    ).subscribe(([devices, incidents, selectedIncidentID, images]) => {
      // aggregate data related to the incidents
      this.incidentData = [];
      incidents.forEach((incident) => {
        const device = devices.find(d => d.id === incident.deviceID);
        const incidentImages = images.filter(i => i.incidentID === incident.id);
        this.incidentData.push({incident, images: incidentImages, device});
      });

      // add selected incident:
      if (selectedIncidentID === undefined) {
        this.selectedIncident = undefined;
      } else {
        this.selectedIncident = this.incidentData.find(i => i.incident.id === selectedIncidentID)
      }
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  selectIncident(id: string) {
    this.incidentService.selectedIncident = id;
  }

}
