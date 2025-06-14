import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { AnalysisService } from '../../services/analysis.service';
import { FileUploadComponent } from '../../components/file-upload/file-upload.component';
import { ResultsTableComponent } from '../../components/results-table/results-table.component';

@Component({
  selector: 'app-analysis',
  standalone: true,
  templateUrl: "./analysis.component.html",
  styleUrl: "./analysis.component.css",
  imports: [CommonModule, ReactiveFormsModule, FileUploadComponent, ResultsTableComponent],
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