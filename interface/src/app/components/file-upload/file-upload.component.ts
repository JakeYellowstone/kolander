import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  styleUrl: "./file-upload.component.css",
  templateUrl: "./file-upload.component.html",
  imports: [CommonModule],
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