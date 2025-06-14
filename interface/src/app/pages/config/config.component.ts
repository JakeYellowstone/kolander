import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ConfigService } from '../../services/config.service';

@Component({
  selector: 'app-config',
  standalone: true,
  templateUrl: "./config.component.html",
  styleUrl: "./config.component.css",
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
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