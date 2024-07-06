import { Component } from '@angular/core';
import { CardComponent } from "../../shared/card/card.component";
import { StatisticsComponent } from "./statistics/statistics.component";
import { IncidentsOverviewComponent } from "./incidents-overview/incidents-overview.component";
import { DevicesOverviewComponent } from "./devices-overview/devices-overview.component";

@Component({
    selector: 'app-overview',
    standalone: true,
    templateUrl: './overview.component.html',
    styleUrl: './overview.component.css',
    imports: [CardComponent, StatisticsComponent, IncidentsOverviewComponent, DevicesOverviewComponent]
})
export class OverviewComponent {

}
