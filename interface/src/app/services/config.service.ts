import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface PriorityRule {
  group: string;
  multiplier: number;
  description: string;
}

export interface AnalysisSettings {
  binaryThreshold: number;
  highPriorityThreshold: number;
  mediumPriorityThreshold: number;
  enableGroupModulation: boolean;
}

export interface Configuration {
  priorityRules: PriorityRule[];
  analysisSettings: AnalysisSettings;
}

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private apiUrl = 'http://localhost:8000';
  private configSubject = new BehaviorSubject<Configuration>(this.getDefaultConfiguration());
  
  public config$ = this.configSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadConfiguration();
  }

  getConfiguration(): Observable<Configuration> {
    return this.config$;
  }

  savePriorityRules(rules: PriorityRule[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/config/priority-rules`, rules).pipe(
      tap(() => {
        const currentConfig = this.configSubject.value;
        const updatedConfig = {
          ...currentConfig,
          priorityRules: rules
        };
        this.configSubject.next(updatedConfig);
        this.saveToLocalStorage(updatedConfig);
      })
    );
  }

  saveAnalysisSettings(settings: AnalysisSettings): Observable<any> {
    return this.http.post(`${this.apiUrl}/config/analysis-settings`, settings).pipe(
      tap(() => {
        const currentConfig = this.configSubject.value;
        const updatedConfig = {
          ...currentConfig,
          analysisSettings: settings
        };
        this.configSubject.next(updatedConfig);
        this.saveToLocalStorage(updatedConfig);
      })
    );
  }

  private loadConfiguration() {
    // Try to load from backend first
    this.http.get(`${this.apiUrl}/config`).subscribe({
      next: (backendConfig: any) => {
        const config: Configuration = {
          priorityRules: this.convertMultipliersToRules(backendConfig.groupMultipliers || {}),
          analysisSettings: backendConfig.analysisSettings || this.getDefaultConfiguration().analysisSettings
        };
        this.configSubject.next(config);
      },
      error: () => {
        // Fallback to localStorage
        const saved = localStorage.getItem('cyber-edr-config');
        if (saved) {
          try {
            const config = JSON.parse(saved);
            this.configSubject.next(config);
          } catch (error) {
            console.error('Error loading configuration:', error);
          }
        }
      }
    });
  }

  private convertMultipliersToRules(multipliers: {[key: string]: number}): PriorityRule[] {
    const descriptions: {[key: string]: string} = {
      'executive': 'Executive team members require immediate attention',
      'management': 'Management personnel have elevated priority',
      'developer': 'Developers may have elevated access requirements',
      'analyst': 'Security analysts have specialized access',
      'user': 'Standard users baseline priority',
      'contractor': 'External contractors have reduced priority'
    };

    return Object.entries(multipliers).map(([group, multiplier]) => ({
      group,
      multiplier,
      description: descriptions[group] || `${group} priority multiplier`
    }));
  }

  private saveToLocalStorage(config: Configuration) {
    localStorage.setItem('cyber-edr-config', JSON.stringify(config));
  }

  private getDefaultConfiguration(): Configuration {
    return {
      priorityRules: [
        { group: 'executive', multiplier: 2.5, description: 'Executive team members require immediate attention' },
        { group: 'management', multiplier: 2.0, description: 'Management personnel have elevated priority' },
        { group: 'developer', multiplier: 1.5, description: 'Developers may have elevated access requirements' },
        { group: 'analyst', multiplier: 1.3, description: 'Security analysts have specialized access' },
        { group: 'user', multiplier: 1.0, description: 'Standard users baseline priority' },
        { group: 'contractor', multiplier: 0.8, description: 'External contractors have reduced priority' }
      ],
      analysisSettings: {
        binaryThreshold: 0.5,
        highPriorityThreshold: 0.8,
        mediumPriorityThreshold: 0.5,
        enableGroupModulation: true
      }
    };
  }
}