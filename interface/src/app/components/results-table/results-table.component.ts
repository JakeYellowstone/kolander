import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-results-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="results-container">
      <div class="results-header">
        <div class="results-stats grid grid-3">
          <div class="stat-card card">
            <div class="stat-icon">📊</div>
            <div class="stat-content">
              <h3>{{ totalProcessed }}</h3>
              <p>Total Records</p>
            </div>
          </div>
          
          <div class="stat-card card priority-high">
            <div class="stat-icon">🚨</div>
            <div class="stat-content">
              <h3>{{ threatsDetected }}</h3>
              <p>Threats Detected</p>
            </div>
          </div>
          
          <div class="stat-card card priority-low">
            <div class="stat-icon">✅</div>
            <div class="stat-content">
              <h3>{{ ((threatsDetected / totalProcessed) * 100).toFixed(1) }}%</h3>
              <p>Detection Rate</p>
            </div>
          </div>
        </div>
        
        <div class="filter-controls">
          <div class="priority-filters">
            <button class="filter-btn" 
                    [class.active]="selectedPriority === 'all'"
                    (click)="filterByPriority('all')">
              All ({{ filteredResults.length }})
            </button>
            <button class="filter-btn priority-high" 
                    [class.active]="selectedPriority === 'high'"
                    (click)="filterByPriority('high')">
              High ({{ getPriorityCount('high') }})
            </button>
            <button class="filter-btn priority-medium" 
                    [class.active]="selectedPriority === 'medium'"
                    (click)="filterByPriority('medium')">
              Medium ({{ getPriorityCount('medium') }})
            </button>
            <button class="filter-btn priority-low" 
                    [class.active]="selectedPriority === 'low'"
                    (click)="filterByPriority('low')">
              Low ({{ getPriorityCount('low') }})
            </button>
          </div>
        </div>
      </div>
      
      <div class="results-table-container">
        <div class="table-wrapper">
          <table class="results-table">
            <thead>
              <tr>
                <th>Priority</th>
                <th>Group</th>
                <th>Host</th>
                <th>Process</th>
                <th>Alert Severity</th>
                <th>Confidence</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let result of paginatedResults; trackBy: trackByIndex" 
                  class="result-row animate-fadeInUp"
                  [class]="'priority-' + result.finalPriority">
                <td>
                  <div class="priority-indicator">
                    <span class="priority-badge" [class]="'priority-' + result.finalPriority">
                      {{ result.finalPriority.toUpperCase() }}
                    </span>
                    <div class="priority-score">{{ (result.priorityScore * 100).toFixed(0) }}%</div>
                  </div>
                </td>
                <td>
                  <div class="group-info">
                    <span class="group-name">{{ result.group }}</span>
                    <span class="group-multiplier">×{{ result.groupMultiplier }}</span>
                  </div>
                </td>
                <td>
                  <div class="host-info">
                    <span class="hostname">{{ result.hostname }}</span>
                    <span class="username">{{ result.username }}</span>
                  </div>
                </td>
                <td>
                  <div class="process-info">
                    <span class="process-name">{{ result.process_name }}</span>
                    <span class="process-path">{{ result.path }}</span>
                  </div>
                </td>
                <td>
                  <span class="severity-badge" [class]="'severity-' + result.alert_severity">
                    {{ result.alert_severity }}
                  </span>
                </td>
                <td>
                  <div class="confidence-meter">
                    <div class="confidence-bar">
                      <div class="confidence-fill" 
                           [style.width.%]="result.confidence * 100"
                           [class]="getConfidenceClass(result.confidence)"></div>
                    </div>
                    <span class="confidence-value">{{ (result.confidence * 100).toFixed(1) }}%</span>
                  </div>
                </td>
                <td>
                  <button class="details-btn btn" (click)="showDetails(result)">
                    View Details
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div class="pagination" *ngIf="totalPages > 1">
          <button class="page-btn" 
                  [disabled]="currentPage === 1"
                  (click)="goToPage(currentPage - 1)">
            ← Previous
          </button>
          
          <div class="page-numbers">
            <button *ngFor="let page of getPageNumbers()" 
                    class="page-btn"
                    [class.active]="page === currentPage"
                    (click)="goToPage(page)">
              {{ page }}
            </button>
          </div>
          
          <button class="page-btn" 
                  [disabled]="currentPage === totalPages"
                  (click)="goToPage(currentPage + 1)">
            Next →
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .results-container {
      margin-top: 2rem;
    }
    
    .results-header {
      margin-bottom: 2rem;
    }
    
    .results-stats {
      margin-bottom: 2rem;
      gap: 1rem;
    }
    
    .stat-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.5rem;
    }
    
    .stat-icon {
      font-size: 2rem;
      opacity: 0.8;
    }
    
    .stat-content h3 {
      font-size: 1.8rem;
      font-weight: 900;
      margin: 0 0 0.25rem 0;
    }
    
    .stat-content p {
      margin: 0;
      color: var(--text-secondary);
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .filter-controls {
      display: flex;
      justify-content: center;
      margin-bottom: 1rem;
    }
    
    .priority-filters {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    
    .filter-btn {
      padding: 0.75rem 1.5rem;
      background: var(--secondary-bg);
      border: 1px solid rgba(0, 245, 255, 0.3);
      color: var(--text-secondary);
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-weight: 500;
    }
    
    .filter-btn:hover,
    .filter-btn.active {
      background: var(--cyber-blue);
      color: var(--primary-bg);
      border-color: var(--cyber-blue);
      box-shadow: var(--shadow-glow);
    }
    
    .filter-btn.priority-high:hover,
    .filter-btn.priority-high.active {
      background: var(--cyber-red);
      border-color: var(--cyber-red);
      box-shadow: 0 0 15px rgba(255, 7, 58, 0.4);
    }
    
    .filter-btn.priority-medium:hover,
    .filter-btn.priority-medium.active {
      background: var(--cyber-orange);
      border-color: var(--cyber-orange);
      box-shadow: 0 0 15px rgba(255, 140, 0, 0.4);
    }
    
    .filter-btn.priority-low:hover,
    .filter-btn.priority-low.active {
      background: var(--cyber-green);
      border-color: var(--cyber-green);
      box-shadow: 0 0 15px rgba(57, 255, 20, 0.4);
    }
    
    .results-table-container {
      background: var(--surface-bg);
      border: 1px solid var(--border-glow);
      border-radius: 8px;
      overflow: hidden;
      box-shadow: var(--shadow-glow);
    }
    
    .table-wrapper {
      overflow-x: auto;
    }
    
    .results-table {
      width: 100%;
      border-collapse: collapse;
    }
    
    .results-table th {
      background: var(--secondary-bg);
      color: var(--cyber-blue);
      padding: 1rem;
      text-align: left;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      font-size: 0.85rem;
      border-bottom: 2px solid var(--cyber-blue);
    }
    
    .results-table td {
      padding: 1rem;
      border-bottom: 1px solid rgba(0, 245, 255, 0.1);
      vertical-align: top;
    }
    
    .result-row {
      transition: all 0.3s ease;
    }
    
    .result-row:hover {
      background: rgba(0, 245, 255, 0.05);
    }
    
    .result-row.priority-high {
      border-left: 4px solid var(--cyber-red);
    }
    
    .result-row.priority-medium {
      border-left: 4px solid var(--cyber-orange);
    }
    
    .result-row.priority-low {
      border-left: 4px solid var(--cyber-green);
    }
    
    .priority-indicator {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
    }
    
    .priority-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 700;
      text-align: center;
      min-width: 60px;
    }
    
    .priority-badge.priority-high {
      background: rgba(255, 7, 58, 0.2);
      color: var(--cyber-red);
      border: 1px solid var(--cyber-red);
    }
    
    .priority-badge.priority-medium {
      background: rgba(255, 140, 0, 0.2);
      color: var(--cyber-orange);
      border: 1px solid var(--cyber-orange);
    }
    
    .priority-badge.priority-low {
      background: rgba(57, 255, 20, 0.2);
      color: var(--cyber-green);
      border: 1px solid var(--cyber-green);
    }
    
    .priority-score {
      font-size: 0.8rem;
      color: var(--text-muted);
      font-weight: 600;
    }
    
    .group-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    
    .group-name {
      font-weight: 600;
      color: var(--text-primary);
    }
    
    .group-multiplier {
      font-size: 0.8rem;
      color: var(--cyber-orange);
      font-weight: 600;
    }
    
    .host-info,
    .process-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    
    .hostname,
    .process-name {
      font-weight: 600;
      color: var(--text-primary);
      font-size: 0.9rem;
    }
    
    .username,
    .process-path {
      font-size: 0.8rem;
      color: var(--text-secondary);
      font-family: 'Courier New', monospace;
    }
    
    .severity-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }
    
    .severity-badge.severity-critical {
      background: rgba(255, 7, 58, 0.2);
      color: var(--cyber-red);
      border: 1px solid var(--cyber-red);
    }
    
    .severity-badge.severity-high {
      background: rgba(255, 140, 0, 0.2);
      color: var(--cyber-orange);
      border: 1px solid var(--cyber-orange);
    }
    
    .severity-badge.severity-medium {
      background: rgba(0, 245, 255, 0.2);
      color: var(--cyber-blue);
      border: 1px solid var(--cyber-blue);
    }
    
    .severity-badge.severity-low {
      background: rgba(57, 255, 20, 0.2);
      color: var(--cyber-green);
      border: 1px solid var(--cyber-green);
    }
    
    .confidence-meter {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      width: 80px;
    }
    
    .confidence-bar {
      height: 8px;
      background: var(--secondary-bg);
      border-radius: 4px;
      overflow: hidden;
    }
    
    .confidence-fill {
      height: 100%;
      border-radius: 4px;
      transition: width 0.3s ease;
    }
    
    .confidence-fill.high {
      background: linear-gradient(90deg, var(--cyber-red), #ff4757);
    }
    
    .confidence-fill.medium {
      background: linear-gradient(90deg, var(--cyber-orange), #ffa502);
    }
    
    .confidence-fill.low {
      background: linear-gradient(90deg, var(--cyber-blue), #3742fa);
    }
    
    .confidence-value {
      font-size: 0.75rem;
      font-weight: 600;
      text-align: center;
      color: var(--text-secondary);
    }
    
    .details-btn {
      padding: 0.5rem 1rem;
      font-size: 0.8rem;
      white-space: nowrap;
    }
    
    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 0.5rem;
      padding: 1.5rem;
      background: var(--secondary-bg);
      border-top: 1px solid rgba(0, 245, 255, 0.1);
    }
    
    .page-btn {
      padding: 0.5rem 1rem;
      background: transparent;
      border: 1px solid rgba(0, 245, 255, 0.3);
      color: var(--text-secondary);
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 0.9rem;
    }
    
    .page-btn:hover:not(:disabled),
    .page-btn.active {
      background: var(--cyber-blue);
      color: var(--primary-bg);
      border-color: var(--cyber-blue);
    }
    
    .page-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .page-numbers {
      display: flex;
      gap: 0.25rem;
    }
    
    @media (max-width: 768px) {
      .results-stats {
        grid-template-columns: 1fr;
      }
      
      .stat-card {
        padding: 1rem;
      }
      
      .priority-filters {
        justify-content: center;
      }
      
      .filter-btn {
        padding: 0.5rem 1rem;
        font-size: 0.8rem;
      }
      
      .results-table th,
      .results-table td {
        padding: 0.75rem 0.5rem;
        font-size: 0.85rem;
      }
      
      .pagination {
        flex-direction: column;
        gap: 1rem;
      }
      
      .page-numbers {
        order: -1;
      }
    }
  `]
})
export class ResultsTableComponent implements OnInit {
  @Input() results: any[] = [];
  @Input() totalProcessed: number = 0;
  @Input() threatsDetected: number = 0;

  filteredResults: any[] = [];
  paginatedResults: any[] = [];
  selectedPriority = 'all';
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  ngOnInit() {
    this.filterByPriority('all');
  }

  ngOnChanges() {
    this.filterByPriority(this.selectedPriority);
  }

  filterByPriority(priority: string) {
    this.selectedPriority = priority;
    
    if (priority === 'all') {
      this.filteredResults = [...this.results];
    } else {
      this.filteredResults = this.results.filter(result => 
        result.finalPriority === priority
      );
    }
    
    // Sort by priority score (descending)
    this.filteredResults.sort((a, b) => b.priorityScore - a.priorityScore);
    
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredResults.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedResults = this.filteredResults.slice(startIndex, endIndex);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  getPageNumbers(): number[] {
    const pages = [];
    const maxPages = 5;
    const startPage = Math.max(1, this.currentPage - Math.floor(maxPages / 2));
    const endPage = Math.min(this.totalPages, startPage + maxPages - 1);
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  getPriorityCount(priority: string): number {
    return this.results.filter(result => result.finalPriority === priority).length;
  }

  getConfidenceClass(confidence: number): string {
    if (confidence >= 0.8) return 'high';
    if (confidence >= 0.6) return 'medium';
    return 'low';
  }

  showDetails(result: any) {
    // Implement details modal or navigation
    console.log('Show details for:', result);
  }

  trackByIndex(index: number, item: any): number {
    return index;
  }
}