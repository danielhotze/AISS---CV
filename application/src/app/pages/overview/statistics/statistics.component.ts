import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { IncidentsService } from '../../../core/services/incidents.service';
import { DevicesService } from '../../../core/services/devices.service';
import { Subject, takeUntil } from 'rxjs';
import { Device } from '../../../core/models/device.model';
import { Incident } from '../../../core/models/incident.model';
import moment from 'moment';
import { ApexChart, ApexAxisChartSeries, ApexXAxis, NgApexchartsModule, ApexYAxis, ApexStroke, ChartComponent, ApexMarkers, ApexDataLabels, ApexTooltip } from 'ng-apexcharts';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  stroke: ApexStroke;
  markers: ApexMarkers;
  tooltip: ApexTooltip;
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
  public devicesCount = 0;

  public chartOptions: Partial<ChartOptions> = {
    series: [{
      name: 'Incidents',
      data: []
    }],
    chart: {
      type: 'line',
      height: 300,
      zoom: {
        enabled: true
      },
      animations: {
        enabled: false
      },

    },
    xaxis: {
      type: 'datetime',
    },
    yaxis: {
      min: 0,
      title: {
        text: 'Number of Incidents',
        style: {
          fontSize: '16px'
        },
        offsetX: 10,
      },
      labels: {
        formatter: function(val) {
          return (val % 1 === 0) ? Math.round(val).toString() : ''; // Runde die Y-Achse auf ganze Zahlen
        },
      }
    },
    stroke: {
      curve: 'smooth',
      width: 4,
      colors: ['#F3451E']
    },
    markers: {
      colors: ['#F3451E'],
      size: 6,
      hover: {
        size: 8
      }
    },
    tooltip: {
      marker: {
        show: true,
        fillColors: ['#F3451E'],
      }
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
      this.devicesCount = devices.length;
    });

    this.incidentService.incidents$.pipe(
      takeUntil(this.destroyed$)
    ).subscribe((incidents) => {
      this.updateChart(incidents, 'day');
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  // private aggregateIncidents(incidents: Incident[], interval: 'hour' | 'day'): { x: Date, y: number }[] {
  //   if (incidents.length === 0) {
  //     return [];
  //   }
  //   const grouped: { [key: string]: number } = {};
  //   const dateFormat = interval === 'hour' ? 'YYYY-MM-DD HH:00:00' : 'YYYY-MM-DD';

  //   incidents.forEach(incident => {
  //     const key = moment(incident.timestamp_start).format(dateFormat);
  //     if (!grouped[key]) {
  //       grouped[key] = 0;
  //     }
  //     grouped[key]++;
  //   });

  //   // Umwandeln in ApexCharts-kompatibles Format
  //   const series = Object.keys(grouped).map(date => ({
  //     x: new Date(date),
  //     y: grouped[date]
  //   }));

  //   return series;
  // }
  private aggregateIncidents(incidents: Incident[], interval: 'hour' | 'day'): { x: Date, y: number }[] {
    if (incidents.length === 0) {
      return [];
    }

    const grouped: { [key: string]: number } = {};
    const dateFormat = interval === 'hour' ? 'YYYY-MM-DD HH:00:00' : 'YYYY-MM-DD';

    incidents.forEach(incident => {
      const key = moment(incident.timestamp_start).format(dateFormat);
      if (!grouped[key]) {
        grouped[key] = 0;
      }
      grouped[key]++;
    });

    // Determine the startpoint of the incidents and the current date
    const startDate = moment(Math.min(...incidents.map(incident => +new Date(incident.timestamp_start))));
    const endDate = moment();

    // Iterate over each interval and fill missing dates with 0
    const series = [];
    let iterateDate = startDate.clone();

    while (iterateDate.isSameOrBefore(endDate, 'day')) {
      const key = iterateDate.format(dateFormat);
      series.push({
        x: new Date(iterateDate.toISOString()),
        y: grouped[key] || 0
      });

      if (interval === 'hour') {
        iterateDate.add(1, 'hour');
      } else {
        iterateDate.add(1, 'day');
      }
    }

    return series;
}

  updateChart(incidents: Incident[], interval: 'hour' | 'day') {
    const series = this.aggregateIncidents(this.filterIncidents(incidents), interval);
    this.chartOptions.series = [{
      name: 'Incidents',
      data: series
    }];
    if (series.length > 0) {
      this.chartReady = true
    }
  }

  filterIncidents(incidents: Incident[]): Incident[] {
    this.filteredIncidents = [...incidents];
    // filter date

    // filter device

    // filter zone
    return this.filteredIncidents;
  }
}
