import { Routes } from '@angular/router';
import { OverviewComponent } from './pages/overview/overview.component';
import { DevicesComponent } from './pages/devices/devices.component';
import { IncidentsComponent } from './pages/incidents/incidents.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';

export const routes: Routes = [
  {path: '', redirectTo: '/overview', pathMatch: 'full' },
  {path: 'overview', component: OverviewComponent},
  {path: 'devices', component: DevicesComponent},
  {path: 'incidents', component: IncidentsComponent},

  {path: '**', component: NotFoundComponent}
];
