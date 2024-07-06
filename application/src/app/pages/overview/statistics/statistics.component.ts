import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { IncidentsService } from '../../../core/services/incidents.service';
import { DevicesService } from '../../../core/services/devices.service';
import { Subject, takeUntil } from 'rxjs';
import { Device } from '../../../core/models/device.model';
import { Incident } from '../../../core/models/incident.model';
import moment from 'moment';
import { ApexChart, ApexAxisChartSeries, ApexXAxis, NgApexchartsModule, ApexYAxis, ApexStroke, ChartComponent } from 'ng-apexcharts';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  stroke: ApexStroke;
};

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [
    MatProgressSpinnerModule,
    NgApexchartsModule
  ],
  templateUrl: './statistics.component.html',
  styleUrl: './statistics.component.css'
})
export class StatisticsComponent implements OnInit, OnDestroy {
  @ViewChild("chart") chart: ChartComponent;

  public chartReady = false;
  public filteredIncidents: Incident[] = [];
  public filteredDevices: Device[] = [];
  public chartOptions: Partial<ChartOptions> = {
    series: [{
      name: 'Incidents',
      data: []
    }],
    chart: {
      type: 'line',
      height: 300,
      zoom: {
        enabled: false
      },
      animations: {
        enabled: false
      }
    },
    xaxis: {
      type: 'datetime'
    },
    yaxis: {
      title: {
        text: 'Number of Incidents'
      },
      labels: {
        formatter: function(val) {
          return Math.round(val).toString(); // Runde die Y-Achse auf ganze Zahlen
        }
      }
    },
    stroke: {
      curve: 'smooth',
      width: 4,
      // colors: ['#009682']
    }
  };

  private destroyed$ = new Subject<void>();

  constructor(
    private incidentService: IncidentsService,
    private devicesService: DevicesService
  ) {}

  ngOnInit(): void {
    this.devicesService.devices$.pipe(
      takeUntil(this.destroyed$)
    ).subscribe((devices) => {
      // todo
    });

    // Handle incidents:
    // this.updateChart(this.incidentService.incidents, 'hour');

    this.incidentService.incidents$.pipe(
      takeUntil(this.destroyed$)
    ).subscribe((incidents) => {
      this.updateChart(incidents, 'hour');
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  private aggregateIncidents(incidents: Incident[], interval: 'hour' | 'day'): { x: Date, y: number }[] {
    if (incidents.length === 0) {
      return [];
    }
    const grouped: { [key: string]: number } = {};
    const dateFormat = interval === 'hour' ? 'YYYY-MM-DD HH:00:00' : 'YYYY-MM-DD';

    incidents.sort((a, b) => new Date(a.timestamp_start).getTime() - new Date(b.timestamp_start).getTime());

    incidents.forEach(incident => {
      const key = moment(incident.timestamp_start).format(dateFormat);
      if (!grouped[key]) {
        grouped[key] = 0;
      }
      grouped[key]++;
    });

    // Umwandeln in ApexCharts-kompatibles Format
    const series = Object.keys(grouped).map(date => ({
      x: new Date(date),
      y: grouped[date]
    }));

    return series;
  }

  updateChart(incidents: Incident[], interval: 'hour' | 'day') {
    const series = this.aggregateIncidents(incidents, interval);
    this.chartOptions.series = [{
      name: 'Incidents',
      data: series
    }];
    if (series.length > 0) {
      this.chartReady = true
    }
  }

  filterIncidents(incidents: Incident[]): Incident[] {
    // filter date

    // filter device

    // filter zone
    return incidents;
  }

  // Devices:
  filterDevices(devices: Device[]): Device[] {
    // filter zone
    // filter ?
    return devices;
  }
}
