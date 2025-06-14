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

  systemStatus = {
    modelsLoaded: false,
    backendConnected: false,
    lastUpdate: new Date()
  };

  recentAlerts = [
    {
      group: 'Executive Team',
      description: 'Analyse en attente - Chargez un fichier EDR',
      severity: 'Info',
      priority: 'low',
      timestamp: new Date()
    }
  ];

  constructor(private analysisService: AnalysisService) {}

  ngOnInit() {
    this.loadSystemStatus();
  }

  loadSystemStatus() {
    this.analysisService.getHealth().subscribe({
      next: (health) => {
        this.systemStatus.modelsLoaded = health.modelsLoaded;
        this.systemStatus.backendConnected = true;
        this.systemStatus.lastUpdate = new Date();
        
        if (health.modelsLoaded) {
          this.recentAlerts = [
            {
              group: 'Système',
              description: 'Modèles ML chargés et prêts pour l\'analyse',
              severity: 'Success',
              priority: 'low',
              timestamp: new Date()
            }
          ];
        }
      },
      error: (error) => {
        this.systemStatus.backendConnected = false;
        this.recentAlerts = [
          {
            group: 'Système',
            description: 'Erreur de connexion au backend',
            severity: 'Error',
            priority: 'high',
            timestamp: new Date()
          }
        ];
      }
    });
  }

  refreshData() {
    this.loadSystemStatus();
    console.log('System status refreshed');
  }
}