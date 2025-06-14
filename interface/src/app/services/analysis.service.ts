import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AnalysisService {
  private apiUrl = 'http://localhost:8000'; // Backend API URL

  constructor(private http: HttpClient) {}

  analyzeData(fileData: any): Observable<any> {
    // For now, return mock data. In production, this would call the Python backend
    return this.generateMockAnalysis(fileData).pipe(delay(2000));
  }

  private generateMockAnalysis(fileData: any): Observable<any> {
    const mockResults = this.generateMockResults(fileData.data || []);
    
    return of({
      totalProcessed: fileData.data?.length || 0,
      threatsDetected: mockResults.length,
      filteredResults: mockResults,
      processingTime: '2.3s',
      modelVersion: '1.2.0'
    });
  }

  private generateMockResults(data: any[]): any[] {
    const groupPriorities = {
      'executive': 2.5,
      'management': 2.0,
      'developer': 1.5,
      'analyst': 1.3,
      'user': 1.0,
      'contractor': 0.8
    };

    const groups = ['executive', 'management', 'developer', 'analyst', 'user', 'contractor'];
    const severities = ['critical', 'high', 'medium', 'low'];
    const processes = [
      'cmd.exe', 'powershell.exe', 'rundll32.exe', 'svchost.exe', 
      'winword.exe', 'excel.exe', 'chrome.exe', 'firefox.exe'
    ];
    const hostnames = [
      'EXEC-001', 'DEV-WORKSTATION', 'USER-PC-045', 'ANALYST-LAB', 
      'CONTRACTOR-VM', 'MGMT-LAPTOP', 'SEC-STATION'
    ];

    const results = [];
    const numResults = Math.min(50, Math.max(10, Math.floor(data.length * 0.1))); // 10% threat detection rate

    for (let i = 0; i < numResults; i++) {
      const group = groups[Math.floor(Math.random() * groups.length)];
      const severity = severities[Math.floor(Math.random() * severities.length)];
      const confidence = 0.5 + Math.random() * 0.5; // 50-100% confidence for threats
      const basePriority = Math.random();
      
      // Apply group multiplier
      const groupMultiplier = groupPriorities[group as keyof typeof groupPriorities] || 1.0;
      const priorityScore = Math.min(1.0, basePriority * groupMultiplier);
      
      // Determine final priority
      let finalPriority = 'low';
      if (priorityScore >= 0.8) finalPriority = 'high';
      else if (priorityScore >= 0.5) finalPriority = 'medium';
      
      results.push({
        id: i + 1,
        group: group,
        hostname: hostnames[Math.floor(Math.random() * hostnames.length)],
        username: `${group}_user_${Math.floor(Math.random() * 100)}`,
        process_name: processes[Math.floor(Math.random() * processes.length)],
        path: `C:\\Windows\\System32\\${processes[Math.floor(Math.random() * processes.length)]}`,
        alert_severity: severity,
        confidence: confidence,
        basePriority: basePriority,
        groupMultiplier: groupMultiplier,
        priorityScore: priorityScore,
        finalPriority: finalPriority,
        childproc_count: Math.floor(Math.random() * 5),
        netconn_count: Math.floor(Math.random() * 10),
        filemod_count: Math.floor(Math.random() * 20),
        timestamp: new Date(Date.now() - Math.random() * 86400000 * 7), // Last 7 days
        cmdline: `"C:\\Windows\\System32\\${processes[Math.floor(Math.random() * processes.length)]}" -param value`,
        parent_name: 'explorer.exe',
        sensor_id: Math.floor(Math.random() * 1000),
        process_pid: Math.floor(Math.random() * 10000),
        parent_pid: Math.floor(Math.random() * 10000)
      });
    }

    // Sort by priority score descending
    return results.sort((a, b) => b.priorityScore - a.priorityScore);
  }
}