import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="header">
      <div class="header-content">
        <div class="logo">
          <h1>
            <span class="cyber-text">CYBER</span>
            <span class="edr-text">EDR</span>
          </h1>
          <p class="tagline">Security Intelligence Platform</p>
        </div>
        
        <nav class="nav">
          <a routerLink="/dashboard" routerLinkActive="active">Dashboard</a>
          <a routerLink="/analysis" routerLinkActive="active">Analysis</a>
          <a routerLink="/config" routerLinkActive="active">Config</a>
        </nav>
        
        <div class="status">
          <div class="status-indicator online"></div>
          <span>System Online</span>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .header {
      background: rgba(26, 26, 26, 0.95);
      backdrop-filter: blur(10px);
      border-bottom: 2px solid var(--cyber-blue);
      box-shadow: 0 4px 20px rgba(0, 245, 255, 0.2);
      position: sticky;
      top: 0;
      z-index: 1000;
    }
    
    .header-content {
      max-width: 1400px;
      margin: 0 auto;
      padding: 1rem 2rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 2rem;
    }
    
    .logo h1 {
      font-family: 'Orbitron', monospace;
      font-size: 1.8rem;
      font-weight: 900;
      margin: 0;
      line-height: 1;
    }
    
    .cyber-text {
      color: var(--cyber-blue);
      text-shadow: 0 0 10px var(--cyber-blue);
    }
    
    .edr-text {
      color: var(--cyber-green);
      text-shadow: 0 0 10px var(--cyber-green);
    }
    
    .tagline {
      font-size: 0.8rem;
      color: var(--text-secondary);
      margin: 0;
      letter-spacing: 2px;
      text-transform: uppercase;
    }
    
    .nav {
      display: flex;
      gap: 2rem;
    }
    
    .nav a {
      color: var(--text-secondary);
      text-decoration: none;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      padding: 0.5rem 1rem;
      border: 1px solid transparent;
      border-radius: 4px;
      transition: all 0.3s ease;
      position: relative;
    }
    
    .nav a:hover,
    .nav a.active {
      color: var(--cyber-blue);
      border-color: var(--cyber-blue);
      box-shadow: 0 0 15px rgba(0, 245, 255, 0.3);
    }
    
    .status {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
      color: var(--text-secondary);
    }
    
    .status-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      animation: pulse 2s infinite;
    }
    
    .status-indicator.online {
      background: var(--cyber-green);
      box-shadow: 0 0 10px var(--cyber-green);
    }
    
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    
    @media (max-width: 768px) {
      .header-content {
        padding: 1rem;
        flex-wrap: wrap;
      }
      
      .nav {
        gap: 1rem;
      }
      
      .nav a {
        padding: 0.25rem 0.5rem;
        font-size: 0.9rem;
      }
      
      .status {
        font-size: 0.8rem;
      }
    }
  `]
})
export class HeaderComponent {}