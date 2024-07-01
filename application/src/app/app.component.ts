import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from "./shared/navbar/navbar.component";
import { ApiService } from './core/services/api.service';

@Component({
    selector: 'app-root',
    standalone: true,
    templateUrl: './app.component.html',
    styleUrl: './app.component.css',
    imports: [RouterOutlet, NavbarComponent]
})
export class AppComponent implements OnInit {
  title = 'application';

  constructor(
    private api: ApiService
  ) {}

  ngOnInit(): void {
    this.startApiInterval();
  }

  private startApiInterval() {
    setInterval(() => {
      try {
        this.api.requestDevices();
        this.api.requestIncidents();
        this.api.requestImages();
      } catch (error) {
        console.error('Something went wrong in the api interval', error);
      }
    }, 30000);
  }
}
