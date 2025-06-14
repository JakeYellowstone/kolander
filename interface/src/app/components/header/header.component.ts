import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  styleUrl : "./header.component.css",
  imports: [CommonModule, RouterModule],
  template: `
    <header class="header">
      <div class="header-content">
        <div class="logo">
          <h1>
            <span class="cyber-text">Kolander </span>
            <span class="edr-text">carbon</span>
          </h1>
          <p class="tagline">Security Intelligence Platform</p>
        </div>
        
        <nav class="nav">
          <a routerLink="/dashboard" routerLinkActive="active">Dashboard</a>
          <a routerLink="/analysis" routerLinkActive="active">Analyse</a>
          <a routerLink="/config" routerLinkActive="active">Config</a>
        </nav>
        
        <div class="status">
          <div class="status-indicator online"></div>
          <span>Système connecté</span>
        </div>
      </div>
    </header>
  `,
})
export class HeaderComponent {}