import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  styleUrl:"./app.component.css",
  templateUrl:"./app.component.html",
  imports: [CommonModule, RouterOutlet, HeaderComponent],
})
export class AppComponent {
  title = 'Kolander-Carbon';
}