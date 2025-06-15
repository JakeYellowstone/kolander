import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AnalysisService {
  private apiUrl = 'http://localhost:8000'; // Backend API URL

  constructor(private http: HttpClient) {}

  analyzeData(fileData: any): Observable<any> {
    // Create FormData to send file to backend
    const formData = new FormData();
    formData.append('file', fileData.file);
    
    return this.http.post(`${this.apiUrl}/analyze`, formData);
  }

  getHealth(): Observable<any> {
    return this.http.get(`${this.apiUrl}/health`);
  }

  getConfig(): Observable<any> {
    return this.http.get(`${this.apiUrl}/config`);
  }

  getDashboardStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboard-stats`);
  }

  resetDashboardStats(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/dashboard-stats/reset`);
  }
}