import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  templateUrl: "./footer.component.html",
  styleUrl: "./footer.component.css",
  imports: [CommonModule],
})
export class FooterComponent {
  
  openEilorWebsite() {
    window.open('https://www.eilor.ci/', '_blank');
  }
}