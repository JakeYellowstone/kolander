import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';

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
    const currentConfig = this.configSubject.value;
    const updatedConfig = {
      ...currentConfig,
      priorityRules: rules
    };
    
    this.configSubject.next(updatedConfig);
    this.saveToLocalStorage(updatedConfig);
    
    // In production, save to backend
    // return this.http.post(`${this.apiUrl}/config/priority-rules`, rules);
    return of({ success: true });
  }

  saveAnalysisSettings(settings: AnalysisSettings): Observable<any> {
    const currentConfig = this.configSubject.value;
    const updatedConfig = {
      ...currentConfig,
      analysisSettings: settings
    };
    
    this.configSubject.next(updatedConfig);
    this.saveToLocalStorage(updatedConfig);
    
    // In production, save to backend
    // return this.http.post(`${this.apiUrl}/config/analysis-settings`, settings);
    return of({ success: true });
  }

  private loadConfiguration() {
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

  private saveToLocalStorage(config: Configuration) {
    localStorage.setItem('cyber-edr-config', JSON.stringify(config));
  }

  private getDefaultConfiguration(): Configuration {
    return {
      priorityRules: [
        { group: 'executive', multiplier: 2.5, description: 'Executive team members require immediate attention' },
        { group: 'management', multiplier: 2.0, description: 'Management personnel have elevated priority' },
        { group: 'developer', multiplier: 1.5, description: 'Developers may have elevated access requirements' },
        { group: 'user', multiplier: 1.0, description: 'Standard users baseline priority' }
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