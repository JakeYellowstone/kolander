import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { AnalysisService } from '../../services/analysis.service';
import { FileUploadComponent } from '../../components/file-upload/file-upload.component';
import { ResultsTableComponent } from '../../components/results-table/results-table.component';

@Component({
  selector: 'app-analysis',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FileUploadComponent, ResultsTableComponent],
  template: `
    <div class="analysis-page animate-fadeInUp">
      <div class="page-header">
        <h1>Threat Analysis</h1>
        <p>Upload EDR data for AI-powered security analysis</p>
      </div>
      
      <div class="analysis-workflow">
        <!-- Step 1: File Upload -->
        <div class="workflow-step" [class.completed]="uploadCompleted">
          <div class="step-header">
            <div class="step-number">1</div>
            <h2>Upload EDR Data</h2>
          </div>
          <app-file-upload 
            (fileUploaded)="onFileUploaded($event)"
            (uploadProgress)="onUploadProgress($event)">
          </app-file-upload>
        </div>
        
        <!-- Step 2: Processing -->
        <div class="workflow-step" [class.active]="isProcessing" [class.completed]="analysisCompleted">
          <div class="step-header">
            <div class="step-number">2</div>
            <h2>AI Analysis</h2>
          </div>
          <div class="processing-panel card" *ngIf="isProcessing || analysisCompleted">
            <div class="processing-status">
              <div class="loading" *ngIf="isProcessing"></div>
              <div class="process-steps">
                <div class="process-step" [class.completed]="processSteps.parsing">
                  <span class="step-icon">📊</span>
                  <span>Data Parsing</span>
                </div>
                <div class="process-step" [class.completed]="processSteps.binaryPrediction">
                  <span class="step-icon">🤖</span>
                  <span>Binary Classification</span>
                </div>
                <div class="process-step" [class.completed]="processSteps.priorityClassification">
                  <span class="step-icon">🎯</span>
                  <span>Priority Analysis</span>
                </div>
                <div class="process-step" [class.completed]="processSteps.groupModulation">
                  <span class="step-icon">👥</span>
                  <span>Group Priority Modulation</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Step 3: Results -->
        <div class="workflow-step" [class.active]="analysisCompleted">
          <div class="step-header">
            <div class="step-number">3</div>
            <h2>Analysis Results</h2>
          </div>
          <app-results-table 
            *ngIf="analysisCompleted"
            [results]="analysisResults"
            [totalProcessed]="totalProcessed"
            [threatsDetected]="threatsDetected">
          </app-results-table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .analysis-page {
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
    
    .analysis-workflow {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }
    
    .workflow-step {
      opacity: 0.6;
      transition: all 0.3s ease;
    }
    
    .workflow-step.active,
    .workflow-step.completed {
      opacity: 1;
    }
    
    .step-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    
    .step-number {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--secondary-bg);
      border: 2px solid var(--cyber-blue);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      color: var(--cyber-blue);
      transition: all 0.3s ease;
    }
    
    .workflow-step.active .step-number,
    .workflow-step.completed .step-number {
      background: var(--cyber-blue);
      color: var(--primary-bg);
      box-shadow: var(--shadow-glow);
    }
    
    .workflow-step.completed .step-number {
      background: var(--cyber-green);
      border-color: var(--cyber-green);
      box-shadow: 0 0 20px rgba(57, 255, 20, 0.4);
    }
    
    .step-header h2 {
      color: var(--text-primary);
      margin: 0;
      font-size: 1.5rem;
    }
    
    .processing-panel {
      padding: 2rem;
    }
    
    .processing-status {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2rem;
    }
    
    .process-steps {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      width: 100%;
    }
    
    .process-step {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem;
      background: var(--secondary-bg);
      border-radius: 6px;
      border: 1px solid rgba(0, 245, 255, 0.2);
      transition: all 0.3s ease;
      opacity: 0.6;
    }
    
    .process-step.completed {
      opacity: 1;
      border-color: var(--cyber-green);
      background: rgba(57, 255, 20, 0.1);
    }
    
    .step-icon {
      font-size: 1.2rem;
    }
    
    .process-step span:last-child {
      font-weight: 500;
      font-size: 0.9rem;
    }
    
    @media (max-width: 768px) {
      .step-header {
        flex-direction: column;
        text-align: center;
      }
      
      .process-steps {
        grid-template-columns: 1fr;
      }
      
      .process-step {
        justify-content: center;
      }
    }
  `]
})
export class AnalysisComponent implements OnInit {
  uploadCompleted = false;
  isProcessing = false;
  analysisCompleted = false;
  
  processSteps = {
    parsing: false,
    binaryPrediction: false,
    priorityClassification: false,
    groupModulation: false
  };
  
  analysisResults: any[] = [];
  totalProcessed = 0;
  threatsDetected = 0;

  constructor(
    private fb: FormBuilder,
    private analysisService: AnalysisService
  ) {}

  ngOnInit() {}

  onFileUploaded(fileData: any) {
    this.uploadCompleted = true;
    this.startAnalysis(fileData);
  }

  onUploadProgress(progress: number) {
    // Handle upload progress if needed
  }

  async startAnalysis(fileData: any) {
    this.isProcessing = true;
    this.resetProcessSteps();
    
    try {
      // Simulate step-by-step processing
      await this.simulateProcessingStep('parsing', 1000);
      await this.simulateProcessingStep('binaryPrediction', 1500);
      await this.simulateProcessingStep('priorityClassification', 1200);
      await this.simulateProcessingStep('groupModulation', 800);
      
      // Call actual analysis service
      const results = await this.analysisService.analyzeData(fileData).toPromise();
      
      this.analysisResults = results.filteredResults || [];
      this.totalProcessed = results.totalProcessed || 0;
      this.threatsDetected = results.threatsDetected || 0;
      
      this.isProcessing = false;
      this.analysisCompleted = true;
      
    } catch (error) {
      console.error('Analysis failed:', error);
      this.isProcessing = false;
    }
  }

  private async simulateProcessingStep(step: string, delay: number) {
    await new Promise(resolve => setTimeout(resolve, delay));
    this.processSteps[step as keyof typeof this.processSteps] = true;
  }

  private resetProcessSteps() {
    this.processSteps = {
      parsing: false,
      binaryPrediction: false,
      priorityClassification: false,
      groupModulation: false
    };
  }
}