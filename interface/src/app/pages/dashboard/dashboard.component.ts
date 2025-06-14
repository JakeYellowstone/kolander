import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AnalysisService } from '../../services/analysis.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard animate-fadeInUp">
      <div class="dashboard-header">
        <h1>Security Dashboard</h1>
        <p>Real-time threat intelligence and analysis overview</p>
      </div>
      
      <div class="stats-grid grid grid-3">
        <div class="stat-card card">
          <div class="stat-icon">🛡️</div>
          <div class="stat-content">
            <h3>{{ stats.totalAlerts }}</h3>
            <p>Total Alerts Analyzed</p>
          </div>
        </div>
        
        <div class="stat-card card priority-high">
          <div class="stat-icon">🚨</div>
          <div class="stat-content">
            <h3>{{ stats.highPriorityAlerts }}</h3>
            <p>High Priority Threats</p>
          </div>
        </div>
        
        <div class="stat-card card priority-medium">
          <div class="stat-icon">⚠️</div>
          <div class="stat-content">
            <h3>{{ stats.mediumPriorityAlerts }}</h3>
            <p>Medium Priority Alerts</p>
          </div>
        </div>
      </div>
      
      <div class="dashboard-content grid grid-2">
        <div class="panel card">
          <h2>Recent Threat Analysis</h2>
          <div class="recent-alerts">
            <div *ngFor="let alert of recentAlerts" class="alert-item" 
                 [ngClass]="'priority-' + alert.priority">
              <div class="alert-info">
                <h4>{{ alert.group }}</h4>
                <p>{{ alert.description }}</p>
                <small>{{ alert.timestamp | date:'short' }}</small>
              </div>
              <div class="alert-severity">
                <span class="severity-badge">{{ alert.severity }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="panel card">
          <h2>System Status</h2>
          <div class="system-status">
            <div class="status-item">
              <span class="status-label">AI Models</span>
              <span class="status-value online">Operational</span>
            </div>
            <div class="status-item">
              <span class="status-label">Data Processing</span>
              <span class="status-value online">Active</span>
            </div>
            <div class="status-item">
              <span class="status-label">Threat Intelligence</span>
              <span class="status-value online">Updated</span>
            </div>
            <div class="status-item">
              <span class="status-label">Security Policies</span>
              <span class="status-value online">Enforced</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="quick-actions">
        <h2>Quick Actions</h2>
        <div class="actions-grid grid grid-3">
          <button class="action-btn btn" routerLink="/analysis">
            📊 New Analysis
          </button>
          <button class="action-btn btn btn-success" routerLink="/config">
            ⚙️ Configure Rules
          </button>
          <button class="action-btn btn btn-danger" (click)="refreshData()">
            🔄 Refresh Data
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .dashboard-header {
      text-align: center;
      margin-bottom: 3rem;
    }
    
    .dashboard-header h1 {
      color: var(--cyber-blue);
      margin-bottom: 0.5rem;
    }
    
    .dashboard-header p {
      color: var(--text-secondary);
      font-size: 1.1rem;
    }
    
    .stats-grid {
      margin-bottom: 3rem;
    }
    
    .stat-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 2rem;
      text-align: left;
    }
    
    .stat-icon {
      font-size: 2.5rem;
      opacity: 0.8;
    }
    
    .stat-content h3 {
      font-size: 2rem;
      font-weight: 900;
      margin: 0;
    }
    
    .stat-content p {
      margin: 0;
      color: var(--text-secondary);
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .dashboard-content {
      margin-bottom: 3rem;
    }
    
    .panel h2 {
      color: var(--cyber-blue);
      margin-bottom: 1.5rem;
      font-size: 1.3rem;
    }
    
    .recent-alerts {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    
    .alert-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      background: var(--secondary-bg);
      border-radius: 6px;
      border-left: 4px solid var(--cyber-blue);
      transition: all 0.3s ease;
    }
    
    .alert-item:hover {
      transform: translateX(4px);
    }
    
    .alert-item.priority-high {
      border-left-color: var(--cyber-red);
    }
    
    .alert-item.priority-medium {
      border-left-color: var(--cyber-orange);
    }
    
    .alert-item.priority-low {
      border-left-color: var(--cyber-green);
    }
    
    .alert-info h4 {
      margin: 0 0 0.25rem 0;
      font-size: 1rem;
    }
    
    .alert-info p {
      margin: 0 0 0.25rem 0;
      font-size: 0.9rem;
      color: var(--text-secondary);
    }
    
    .alert-info small {
      color: var(--text-muted);
      font-size: 0.8rem;
    }
    
    .severity-badge {
      padding: 0.25rem 0.75rem;
      background: var(--cyber-blue);
      color: var(--primary-bg);
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
    }
    
    .system-status {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    
    .status-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 0;
      border-bottom: 1px solid rgba(0, 245, 255, 0.1);
    }
    
    .status-item:last-child {
      border-bottom: none;
    }
    
    .status-label {
      font-weight: 500;
    }
    
    .status-value {
      font-weight: 600;
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.8rem;
      text-transform: uppercase;
    }
    
    .status-value.online {
      background: rgba(57, 255, 20, 0.2);
      color: var(--cyber-green);
      border: 1px solid var(--cyber-green);
    }
    
    .quick-actions h2 {
      color: var(--cyber-blue);
      margin-bottom: 1.5rem;
      text-align: center;
    }
    
    .actions-grid {
      gap: 1rem;
    }
    
    .action-btn {
      padding: 1.5rem;
      font-size: 1.1rem;
      width: 100%;
      height: auto;
      white-space: nowrap;
    }
    
    @media (max-width: 768px) {
      .stat-card {
        padding: 1.5rem;
      }
      
      .stat-icon {
        font-size: 2rem;
      }
      
      .stat-content h3 {
        font-size: 1.5rem;
      }
      
      .alert-item {
        flex-direction: column;
        align-items: flex-start;
        text-align: left;
      }
      
      .action-btn {
        padding: 1rem;
        font-size: 1rem;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  stats = {
    totalAlerts: 0,
    highPriorityAlerts: 0,
    mediumPriorityAlerts: 0
  };

  recentAlerts = [
    {
      group: 'Executive Team',
      description: 'Suspicious process execution detected',
      severity: 'Critical',
      priority: 'high',
      timestamp: new Date(Date.now() - 5 * 60 * 1000)
    },
    {
      group: 'Development Team',
      description: 'Unusual network activity observed',
      severity: 'High',
      priority: 'medium',
      timestamp: new Date(Date.now() - 15 * 60 * 1000)
    },
    {
      group: 'General Users',
      description: 'Policy violation detected',
      severity: 'Medium',
      priority: 'low',
      timestamp: new Date(Date.now() - 30 * 60 * 1000)
    }
  ];

  constructor(private analysisService: AnalysisService) {}

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    // Simulate loading stats from analysis results
    this.stats = {
      totalAlerts: 1247,
      highPriorityAlerts: 23,
      mediumPriorityAlerts: 89
    };
  }

  refreshData() {
    this.loadStats();
    // Add visual feedback for refresh action
    console.log('Data refreshed');
  }
}