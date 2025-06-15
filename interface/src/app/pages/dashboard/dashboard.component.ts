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
    mediumPriorityAlerts: 0,
    lowPriorityAlerts: 0,
    totalAnalyses: 0,
    detectionRate: 0,
    averageThreatsPerAnalysis: 0
  };

  systemStatus = {
    modelsLoaded: false,
    backendConnected: false,
    configLoaded: false,
    statsLoaded: false,
    lastUpdate: new Date()
  };

  recentAlerts = [
    {
      group: 'Système',
      description: 'Chargement des statistiques...',
      severity: 'Info',
      priority: 'low',
      timestamp: new Date()
    }
  ];

  constructor(private analysisService: AnalysisService) {}

  ngOnInit() {
    this.loadSystemStatus();
    this.loadDashboardStats();
  }

  loadSystemStatus() {
    this.analysisService.getHealth().subscribe({
      next: (health) => {
        this.systemStatus.modelsLoaded = health.modelsLoaded;
        this.systemStatus.backendConnected = true;
        this.systemStatus.configLoaded = health.configLoaded;
        this.systemStatus.statsLoaded = health.statsLoaded;
        this.systemStatus.lastUpdate = new Date();
        
        this.updateSystemAlerts(health);
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

  loadDashboardStats() {
    this.analysisService.getDashboardStats().subscribe({
      next: (dashboardStats) => {
        this.stats = {
          totalAlerts: dashboardStats.totalThreatsDetected,
          highPriorityAlerts: dashboardStats.priorityBreakdown.high,
          mediumPriorityAlerts: dashboardStats.priorityBreakdown.medium,
          lowPriorityAlerts: dashboardStats.priorityBreakdown.low,
          totalAnalyses: dashboardStats.totalAnalyses,
          detectionRate: dashboardStats.detectionRate,
          averageThreatsPerAnalysis: dashboardStats.averageThreatsPerAnalysis
        };

        // Update alerts based on stats
        this.updateStatsAlerts(dashboardStats);
      },
      error: (error) => {
        console.error('Error loading dashboard stats:', error);
        this.recentAlerts.push({
          group: 'Statistiques',
          description: 'Erreur lors du chargement des statistiques',
          severity: 'Error',
          priority: 'medium',
          timestamp: new Date()
        });
      }
    });
  }

  private updateSystemAlerts(health: any) {
    const alerts = [];

    if (health.modelsLoaded) {
      alerts.push({
        group: 'Modèles ML',
        description: 'Modèles de classification chargés et opérationnels',
        severity: 'Success',
        priority: 'low',
        timestamp: new Date()
      });
    } else {
      alerts.push({
        group: 'Modèles ML',
        description: 'Modèles non chargés - Fonctionnalité limitée',
        severity: 'Error',
        priority: 'high',
        timestamp: new Date()
      });
    }

    if (health.configLoaded) {
      alerts.push({
        group: 'Configuration',
        description: 'Configuration personnalisée chargée',
        severity: 'Success',
        priority: 'low',
        timestamp: new Date()
      });
    }

    if (health.statsLoaded) {
      alerts.push({
        group: 'Statistiques',
        description: 'Historique des analyses disponible',
        severity: 'Success',
        priority: 'low',
        timestamp: new Date()
      });
    }

    this.recentAlerts = alerts;
  }

  private updateStatsAlerts(dashboardStats: any) {
    if (dashboardStats.totalAnalyses === 0) {
      this.recentAlerts.unshift({
        group: 'Analyses',
        description: 'Aucune analyse effectuée - Chargez un fichier EDR',
        severity: 'Info',
        priority: 'low',
        timestamp: new Date()
      });
    } else {
      this.recentAlerts.unshift({
        group: 'Analyses',
        description: `${dashboardStats.totalAnalyses} analyses effectuées - Taux de détection: ${dashboardStats.detectionRate}%`,
        severity: 'Success',
        priority: 'low',
        timestamp: new Date()
      });
    }

    // Keep only the 5 most recent alerts
    this.recentAlerts = this.recentAlerts.slice(0, 5);
  }

  refreshData() {
    this.loadSystemStatus();
    this.loadDashboardStats();
    console.log('System status and statistics refreshed');
  }

  resetStats() {
    if (confirm('Êtes-vous sûr de vouloir réinitialiser toutes les statistiques ?')) {
      this.analysisService.resetDashboardStats().subscribe({
        next: () => {
          this.loadDashboardStats();
          this.recentAlerts.unshift({
            group: 'Statistiques',
            description: 'Statistiques réinitialisées avec succès',
            severity: 'Info',
            priority: 'low',
            timestamp: new Date()
          });
        },
        error: (error) => {
          console.error('Error resetting stats:', error);
          this.recentAlerts.unshift({
            group: 'Statistiques',
            description: 'Erreur lors de la réinitialisation',
            severity: 'Error',
            priority: 'medium',
            timestamp: new Date()
          });
        }
      });
    }
  }
}