import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="file-upload-container">
      <div class="file-upload" 
           [class.drag-over]="isDragOver"
           (dragover)="onDragOver($event)"
           (dragleave)="onDragLeave($event)"
           (drop)="onFileDropped($event)"
           (click)="fileInput.click()">
        
        <input #fileInput 
               type="file" 
               accept=".xlsx,.xls,.csv" 
               (change)="onFileSelected($event)"
               style="display: none;">
        
        <div class="upload-content">
          <div class="upload-icon">📊</div>
          <h3>Upload EDR Data File</h3>
          <p>Drop your Excel file here or click to browse</p>
          <div class="supported-formats">
            <span class="format-badge">.XLSX</span>
            <span class="format-badge">.XLS</span>
            <span class="format-badge">.CSV</span>
          </div>
        </div>
      </div>
      
      <div class="upload-progress" *ngIf="isUploading">
        <div class="progress-bar">
          <div class="progress-fill" [style.width.%]="uploadProgress"></div>
        </div>
        <p>Processing file... {{ uploadProgress }}%</p>
      </div>
      
      <div class="file-info" *ngIf="uploadedFile">
        <div class="file-details card">
          <h4>File Information</h4>
          <div class="file-stats">
            <div class="stat">
              <span class="label">Filename:</span>
              <span class="value">{{ uploadedFile.name }}</span>
            </div>
            <div class="stat">
              <span class="label">Size:</span>
              <span class="value">{{ formatFileSize(uploadedFile.size) }}</span>
            </div>
            <div class="stat">
              <span class="label">Rows:</span>
              <span class="value">{{ parsedData.length }}</span>
            </div>
            <div class="stat">
              <span class="label">Columns:</span>
              <span class="value">{{ parsedColumns.length }}</span>
            </div>
          </div>
          
          <div class="detected-fields">
            <h5>Detected EDR Fields</h5>
            <div class="fields-grid">
              <span *ngFor="let field of detectedEdrFields" 
                    class="field-badge" 
                    [class.found]="field.found">
                {{ field.name }}
                <span class="field-status">{{ field.found ? '✓' : '✗' }}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .file-upload-container {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    
    .file-upload {
      border: 2px dashed rgba(0, 245, 255, 0.5);
      border-radius: 12px;
      padding: 3rem 2rem;
      text-align: center;
      transition: all 0.3s ease;
      cursor: pointer;
      background: var(--surface-bg);
      position: relative;
      overflow: hidden;
    }
    
    .file-upload:hover {
      border-color: var(--cyber-blue);
      background: rgba(0, 245, 255, 0.05);
      box-shadow: var(--shadow-glow);
    }
    
    .file-upload.drag-over {
      border-color: var(--cyber-green);
      background: rgba(57, 255, 20, 0.1);
      box-shadow: 0 0 30px rgba(57, 255, 20, 0.4);
    }
    
    .file-upload::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(0, 245, 255, 0.1), transparent);
      transition: left 0.5s;
    }
    
    .file-upload:hover::before {
      left: 100%;
    }
    
    .upload-content {
      position: relative;
      z-index: 1;
    }
    
    .upload-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
      opacity: 0.8;
    }
    
    .upload-content h3 {
      color: var(--cyber-blue);
      margin-bottom: 0.5rem;
      font-size: 1.5rem;
    }
    
    .upload-content p {
      color: var(--text-secondary);
      margin-bottom: 1.5rem;
      font-size: 1.1rem;
    }
    
    .supported-formats {
      display: flex;
      justify-content: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    
    .format-badge {
      padding: 0.25rem 0.75rem;
      background: var(--cyber-blue);
      color: var(--primary-bg);
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 600;
    }
    
    .upload-progress {
      text-align: center;
    }
    
    .progress-bar {
      width: 100%;
      height: 8px;
      background: var(--secondary-bg);
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 1rem;
    }
    
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--cyber-blue), var(--cyber-green));
      transition: width 0.3s ease;
      box-shadow: 0 0 10px rgba(0, 245, 255, 0.5);
    }
    
    .upload-progress p {
      color: var(--cyber-blue);
      font-weight: 600;
      margin: 0;
    }
    
    .file-details {
      padding: 1.5rem;
    }
    
    .file-details h4 {
      color: var(--cyber-green);
      margin-bottom: 1rem;
      font-size: 1.2rem;
    }
    
    .file-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }
    
    .stat {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem;
      background: var(--secondary-bg);
      border-radius: 6px;
      border-left: 3px solid var(--cyber-blue);
    }
    
    .stat .label {
      font-weight: 500;
      color: var(--text-secondary);
    }
    
    .stat .value {
      font-weight: 600;
      color: var(--text-primary);
    }
    
    .detected-fields h5 {
      color: var(--cyber-blue);
      margin-bottom: 1rem;
      font-size: 1rem;
    }
    
    .fields-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 0.5rem;
    }
    
    .field-badge {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem 0.75rem;
      background: var(--secondary-bg);
      border: 1px solid rgba(255, 7, 58, 0.3);
      border-radius: 6px;
      font-size: 0.85rem;
      font-weight: 500;
      color: var(--cyber-red);
    }
    
    .field-badge.found {
      border-color: rgba(57, 255, 20, 0.5);
      background: rgba(57, 255, 20, 0.1);
      color: var(--cyber-green);
    }
    
    .field-status {
      font-weight: 700;
    }
    
    @media (max-width: 768px) {
      .file-upload {
        padding: 2rem 1rem;
      }
      
      .upload-icon {
        font-size: 3rem;
      }
      
      .file-stats {
        grid-template-columns: 1fr;
      }
      
      .fields-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class FileUploadComponent {
  @Output() fileUploaded = new EventEmitter<any>();
  @Output() uploadProgress = new EventEmitter<number>();

  isDragOver = false;
  isUploading = false;
  uploadedFile: File | null = null;
  parsedData: any[] = [];
  parsedColumns: string[] = [];
  uploadProgressValue = 0;

  // EDR fields that we expect to find in the Carbon Black data
  expectedEdrFields = [
    'alert_severity',
    'childproc_count',
    'group',
    'hostname',
    'process_name',
    'cmdline',
    'parent_name',
    'username',
    'path',
    'netconn_count',
    'filemod_count',
    'regmod_count',
    'crossproc_count',
    'last_update',
    'start',
    'sensor_id',
    'cb_server',
    'process_pid',
    'parent_pid',
    'process_md5',
    'parent_md5'
  ];

  detectedEdrFields: Array<{name: string, found: boolean}> = [];

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onFileDropped(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.processFile(files[0]);
    }
  }

  onFileSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    const files = target.files;
    if (files && files.length > 0) {
      this.processFile(files[0]);
    }
  }

  async processFile(file: File) {
    this.uploadedFile = file;
    this.isUploading = true;
    this.uploadProgressValue = 0;

    try {
      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        this.uploadProgressValue = i;
        this.uploadProgress.emit(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Parse the file
      const data = await this.parseExcelFile(file);
      this.parsedData = data;
      this.parsedColumns = data.length > 0 ? Object.keys(data[0]) : [];
      
      // Detect EDR fields
      this.detectEdrFields();
      
      this.isUploading = false;
      
      // Emit the parsed data
      this.fileUploaded.emit({
        file: file,
        data: data,
        columns: this.parsedColumns,
        edrFields: this.detectedEdrFields
      });
      
    } catch (error) {
      console.error('Error processing file:', error);
      this.isUploading = false;
    }
  }

  private parseExcelFile(file: File): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Get the first worksheet
          const worksheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[worksheetName];
          
          // Convert to JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  }

  private detectEdrFields() {
    this.detectedEdrFields = this.expectedEdrFields.map(field => ({
      name: field,
      found: this.parsedColumns.some(col => 
        col.toLowerCase().includes(field.toLowerCase()) ||
        field.toLowerCase().includes(col.toLowerCase())
      )
    }));
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}