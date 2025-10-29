import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [IonicModule, RouterModule, RouterOutlet]
})
export class AppComponent {}

