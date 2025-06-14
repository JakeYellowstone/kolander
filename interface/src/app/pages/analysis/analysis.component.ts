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
  analysisError = false;
  errorMessage = '';
  
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

  ngOnInit() {
    // Check if backend is healthy
    this.checkBackendHealth();
  }

  checkBackendHealth() {
    this.analysisService.getHealth().subscribe({
      next: (health) => {
        if (!health.modelsLoaded) {
          this.errorMessage = 'Les modèles ML ne sont pas chargés. Veuillez contacter l\'administrateur.';
        }
      },
      error: (error) => {
        this.errorMessage = 'Impossible de se connecter au backend. Vérifiez que le serveur est démarré.';
      }
    });
  }

  onFileUploaded(fileData: any) {
    this.uploadCompleted = true;
    this.startAnalysis(fileData);
  }

  onUploadProgress(progress: number) {
    // Handle upload progress if needed
  }

  async startAnalysis(fileData: any) {
    this.isProcessing = true;
    this.analysisError = false;
    this.errorMessage = '';
    this.resetProcessSteps();
    
    try {
      // Simulate step-by-step processing for UI feedback
      await this.simulateProcessingStep('parsing', 500);
      await this.simulateProcessingStep('binaryPrediction', 800);
      await this.simulateProcessingStep('priorityClassification', 600);
      await this.simulateProcessingStep('groupModulation', 400);
      
      // Call real analysis service
      this.analysisService.analyzeData(fileData).subscribe({
        next: (results) => {
          this.analysisResults = results.filteredResults || [];
          this.totalProcessed = results.totalProcessed || 0;
          this.threatsDetected = results.threatsDetected || 0;
          
          this.isProcessing = false;
          this.analysisCompleted = true;
          
          console.log('Analysis completed:', {
            totalProcessed: this.totalProcessed,
            threatsDetected: this.threatsDetected,
            results: this.analysisResults.length
          });
        },
        error: (error) => {
          console.error('Analysis failed:', error);
          this.isProcessing = false;
          this.analysisError = true;
          this.errorMessage = error.error?.detail || 'Erreur lors de l\'analyse. Vérifiez le format du fichier.';
        }
      });
      
    } catch (error) {
      console.error('Analysis failed:', error);
      this.isProcessing = false;
      this.analysisError = true;
      this.errorMessage = 'Erreur inattendue lors de l\'analyse.';
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

  resetAnalysis() {
    this.uploadCompleted = false;
    this.isProcessing = false;
    this.analysisCompleted = false;
    this.analysisError = false;
    this.errorMessage = '';
    this.analysisResults = [];
    this.totalProcessed = 0;
    this.threatsDetected = 0;
    this.resetProcessSteps();
  }
}