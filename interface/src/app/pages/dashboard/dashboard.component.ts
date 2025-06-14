import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AnalysisService } from '../../services/analysis.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: "./dashboard.component.html",
  styleUrl:"./dashboard.component.css",
  imports: [CommonModule, RouterModule],
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