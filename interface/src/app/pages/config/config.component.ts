import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ConfigService } from '../../services/config.service';

@Component({
  selector: 'app-config',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  template: `
    <div class="config-page animate-fadeInUp">
      <div class="page-header">
        <h1>Configuration</h1>
        <p>Manage priority rules and system settings</p>
      </div>
      
      <div class="config-sections grid grid-2">
        <!-- Priority Rules -->
        <div class="config-section card">
          <h2>Group Priority Rules</h2>
          <p class="section-description">
            Define how user groups affect threat priority classification
          </p>
          
          <form [formGroup]="priorityForm" (ngSubmit)="savePriorityRules()">
            <div formArrayName="groupRules" class="rules-list">
              <div *ngFor="let rule of groupRulesArray.controls; let i = index" 
                   [formGroupName]="i" class="rule-item">
                <div class="rule-header">
                  <h4>Rule {{ i + 1 }}</h4>
                  <button type="button" class="btn btn-danger" 
                          (click)="removeRule(i)" *ngIf="groupRulesArray.length > 1">
                    Remove
                  </button>
                </div>
                
                <div class="form-group">
                  <label>Group Name</label>
                  <select formControlName="group" class="form-control">
                    <option value="executive">Executive Team</option>
                    <option value="management">Management</option>
                    <option value="developer">Development Team</option>
                    <option value="analyst">Security Analysts</option>
                    <option value="user">General Users</option>
                    <option value="contractor">Contractors</option>
                  </select>
                </div>
                
                <div class="form-group">
                  <label>Priority Multiplier</label>
                  <input type="number" formControlName="multiplier" 
                         class="form-control" min="0.1" max="3.0" step="0.1">
                  <small>Higher values increase priority (1.0 = no change)</small>
                </div>
                
                <div class="form-group">
                  <label>Description</label>
                  <textarea formControlName="description" 
                            class="form-control" rows="2"></textarea>
                </div>
              </div>
            </div>
            
            <div class="form-actions">
              <button type="button" class="btn btn-success" (click)="addRule()">
                Add Rule
              </button>
              <button type="submit" class="btn" [disabled]="!priorityForm.valid">
                Save Priority Rules
              </button>
            </div>
          </form>
        </div>
        
        <!-- Analysis Settings -->
        <div class="config-section card">
          <h2>Analysis Settings</h2>
          <p class="section-description">
            Configure AI model parameters and thresholds
          </p>
          
          <form [formGroup]="analysisForm" (ngSubmit)="saveAnalysisSettings()">
            <div class="form-group">
              <label>Binary Classification Threshold</label>
              <input type="range" formControlName="binaryThreshold" 
                     class="range-input" min="0.1" max="0.9" step="0.1">
              <div class="range-value">{{ analysisForm.get('binaryThreshold')?.value }}</div>
              <small>Minimum confidence for threat detection</small>
            </div>
            
            <div class="form-group">
              <label>High Priority Threshold</label>
              <input type="range" formControlName="highPriorityThreshold" 
                     class="range-input" min="0.6" max="1.0" step="0.05">
              <div class="range-value">{{ analysisForm.get('highPriorityThreshold')?.value }}</div>
              <small>Minimum score for high priority classification</small>
            </div>
            
            <div class="form-group">
              <label>Medium Priority Threshold</label>
              <input type="range" formControlName="mediumPriorityThreshold" 
                     class="range-input" min="0.3" max="0.8" step="0.05">
              <div class="range-value">{{ analysisForm.get('mediumPriorityThreshold')?.value }}</div>
              <small>Minimum score for medium priority classification</small>
            </div>
            
            <div class="form-group">
              <label>Enable Group Modulation</label>
              <div class="toggle-switch">
                <input type="checkbox" formControlName="enableGroupModulation" 
                       id="groupModulation">
                <label for="groupModulation" class="toggle-label"></label>
              </div>
              <small>Apply group-based priority adjustments</small>
            </div>
            
            <div class="form-actions">
              <button type="submit" class="btn" [disabled]="!analysisForm.valid">
                Save Analysis Settings
              </button>
              <button type="button" class="btn btn-danger" (click)="resetToDefaults()">
                Reset to Defaults
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <!-- Current Configuration Display -->
      <div class="current-config card">
        <h2>Current Configuration</h2>
        <div class="config-display grid grid-2">
          <div class="config-group">
            <h3>Priority Rules Summary</h3>
            <div class="rules-summary">
              <div *ngFor="let rule of getCurrentPriorityRules()" class="rule-summary">
                <span class="group-name">{{ rule.group }}</span>
                <span class="multiplier">×{{ rule.multiplier }}</span>
              </div>
            </div>
          </div>
          
          <div class="config-group">
            <h3>Analysis Thresholds</h3>
            <div class="thresholds-summary">
              <div class="threshold-item">
                <span>Binary Classification:</span>
                <span class="threshold-value">{{ analysisForm.get('binaryThreshold')?.value }}</span>
              </div>
              <div class="threshold-item">
                <span>High Priority:</span>
                <span class="threshold-value">{{ analysisForm.get('highPriorityThreshold')?.value }}</span>
              </div>
              <div class="threshold-item">
                <span>Medium Priority:</span>
                <span class="threshold-value">{{ analysisForm.get('mediumPriorityThreshold')?.value }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .config-page {
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .page-header {
      text-align: center;
      margin-bottom: 3rem;
    }
    
    .page-header h1 {
      color: var(--cyber-blue);
      margin-bottom: 0.5rem;
    }
    
    .page-header p {
      color: var(--text-secondary);
      font-size: 1.1rem;
    }
    
    .config-sections {
      margin-bottom: 3rem;
      gap: 2rem;
    }
    
    .config-section {
      padding: 2rem;
    }
    
    .config-section h2 {
      color: var(--cyber-blue);
      margin-bottom: 0.5rem;
    }
    
    .section-description {
      color: var(--text-secondary);
      margin-bottom: 2rem;
      font-size: 0.95rem;
    }
    
    .rules-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    
    .rule-item {
      background: var(--secondary-bg);
      border: 1px solid rgba(0, 245, 255, 0.2);
      border-radius: 6px;
      padding: 1.5rem;
    }
    
    .rule-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    
    .rule-header h4 {
      color: var(--cyber-green);
      margin: 0;
    }
    
    .form-group {
      margin-bottom: 1.5rem;
    }
    
    .form-group:last-child {
      margin-bottom: 0;
    }
    
    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: var(--cyber-blue);
      font-size: 0.9rem;
    }
    
    .form-control {
      width: 100%;
      padding: 0.75rem;
      background: var(--primary-bg);
      border: 1px solid rgba(0, 245, 255, 0.3);
      border-radius: 4px;
      color: var(--text-primary);
      font-size: 0.95rem;
    }
    
    .form-control:focus {
      outline: none;
      border-color: var(--cyber-blue);
      box-shadow: 0 0 10px rgba(0, 245, 255, 0.3);
    }
    
    small {
      display: block;
      margin-top: 0.25rem;
      color: var(--text-muted);
      font-size: 0.8rem;
    }
    
    .range-input {
      width: 100%;
      height: 6px;
      background: var(--secondary-bg);
      border-radius: 3px;
      outline: none;
      margin-bottom: 0.5rem;
    }
    
    .range-input::-webkit-slider-thumb {
      appearance: none;
      width: 20px;
      height: 20px;
      background: var(--cyber-blue);
      border-radius: 50%;
      cursor: pointer;
      box-shadow: var(--shadow-glow);
    }
    
    .range-value {
      text-align: center;
      font-weight: 600;
      color: var(--cyber-blue);
      font-size: 1.1rem;
    }
    
    .toggle-switch {
      position: relative;
      display: inline-block;
      width: 60px;
      height: 30px;
    }
    
    .toggle-switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }
    
    .toggle-label {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: var(--secondary-bg);
      border: 2px solid rgba(0, 245, 255, 0.3);
      border-radius: 30px;
      transition: all 0.3s ease;
    }
    
    .toggle-label:before {
      position: absolute;
      content: "";
      height: 20px;
      width: 20px;
      left: 2px;
      bottom: 2px;
      background: var(--text-muted);
      border-radius: 50%;
      transition: all 0.3s ease;
    }
    
    input:checked + .toggle-label {
      background: var(--cyber-blue);
      border-color: var(--cyber-blue);
      box-shadow: var(--shadow-glow);
    }
    
    input:checked + .toggle-label:before {
      transform: translateX(30px);
      background: var(--primary-bg);
    }
    
    .form-actions {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }
    
    .current-config {
      padding: 2rem;
    }
    
    .current-config h2 {
      color: var(--cyber-blue);
      margin-bottom: 1.5rem;
      text-align: center;
    }
    
    .config-display {
      gap: 2rem;
    }
    
    .config-group h3 {
      color: var(--cyber-green);
      margin-bottom: 1rem;
      font-size: 1.1rem;
    }
    
    .rules-summary {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .rule-summary {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem 0.75rem;
      background: var(--secondary-bg);
      border-radius: 4px;
      border-left: 3px solid var(--cyber-blue);
    }
    
    .group-name {
      font-weight: 500;
    }
    
    .multiplier {
      font-weight: 600;
      color: var(--cyber-orange);
    }
    
    .thresholds-summary {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .threshold-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem 0.75rem;
      background: var(--secondary-bg);
      border-radius: 4px;
      border-left: 3px solid var(--cyber-green);
    }
    
    .threshold-value {
      font-weight: 600;
      color: var(--cyber-blue);
    }
    
    @media (max-width: 768px) {
      .config-sections {
        grid-template-columns: 1fr;
      }
      
      .config-display {
        grid-template-columns: 1fr;
      }
      
      .form-actions {
        flex-direction: column;
      }
      
      .rule-header {
        flex-direction: column;
        gap: 1rem;
        align-items: flex-start;
      }
    }
  `]
})
export class ConfigComponent implements OnInit {
  priorityForm: FormGroup;
  analysisForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private configService: ConfigService
  ) {
    this.priorityForm = this.fb.group({
      groupRules: this.fb.array([])
    });

    this.analysisForm = this.fb.group({
      binaryThreshold: [0.5],
      highPriorityThreshold: [0.8],
      mediumPriorityThreshold: [0.5],
      enableGroupModulation: [true]
    });
  }

  ngOnInit() {
    this.loadConfiguration();
    this.addDefaultRules();
  }

  get groupRulesArray() {
    return this.priorityForm.get('groupRules') as FormArray;
  }

  addDefaultRules() {
    const defaultRules = [
      { group: 'executive', multiplier: 2.5, description: 'Executive team members require immediate attention' },
      { group: 'management', multiplier: 2.0, description: 'Management personnel have elevated priority' },
      { group: 'developer', multiplier: 1.5, description: 'Developers may have elevated access requirements' },
      { group: 'user', multiplier: 1.0, description: 'Standard users baseline priority' }
    ];

    defaultRules.forEach(rule => {
      this.groupRulesArray.push(this.fb.group(rule));
    });
  }

  addRule() {
    const newRule = this.fb.group({
      group: ['user'],
      multiplier: [1.0],
      description: ['']
    });
    this.groupRulesArray.push(newRule);
  }

  removeRule(index: number) {
    this.groupRulesArray.removeAt(index);
  }

  loadConfiguration() {
    // Load existing configuration from service
    this.configService.getConfiguration().subscribe(config => {
      if (config.analysisSettings) {
        this.analysisForm.patchValue(config.analysisSettings);
      }
    });
  }

  savePriorityRules() {
    if (this.priorityForm.valid) {
      const rules = this.priorityForm.value.groupRules;
      this.configService.savePriorityRules(rules).subscribe(() => {
        console.log('Priority rules saved successfully');
      });
    }
  }

  saveAnalysisSettings() {
    if (this.analysisForm.valid) {
      const settings = this.analysisForm.value;
      this.configService.saveAnalysisSettings(settings).subscribe(() => {
        console.log('Analysis settings saved successfully');
      });
    }
  }

  resetToDefaults() {
    this.analysisForm.patchValue({
      binaryThreshold: 0.5,
      highPriorityThreshold: 0.8,
      mediumPriorityThreshold: 0.5,
      enableGroupModulation: true
    });
  }

  getCurrentPriorityRules() {
    return this.groupRulesArray.value || [];
  }
}