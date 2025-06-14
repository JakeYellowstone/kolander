import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-results-table",
  standalone: true,
  templateUrl: "results-table.component.html",
  styleUrl: "./results-table.component.css",
  imports: [CommonModule],
})
export class ResultsTableComponent implements OnInit, OnChanges {
  @Input() results: any[] = [];
  @Input() totalProcessed: number = 0;
  @Input() threatsDetected: number = 0;

  filteredResults: any[] = [];
  paginatedResults: any[] = [];
  selectedPriority = "all";
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  ngOnInit() {
    this.filterByPriority("all");
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes["results"]) {
      this.filterByPriority(this.selectedPriority);
    }
  }

  filterByPriority(priority: string) {
    this.selectedPriority = priority;

    if (priority === "all") {
      this.filteredResults = [...this.results];
    } else {
      this.filteredResults = this.results.filter(
        (result) => result.finalPriority === priority
      );
    }

    // Sort by priority score (descending)
    this.filteredResults.sort((a, b) => b.priorityScore - a.priorityScore);

    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination() {
    this.totalPages = Math.ceil(
      this.filteredResults.length / this.itemsPerPage
    );
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
    return this.results.filter((result) => result.finalPriority === priority)
      .length;
  }

  getConfidenceClass(confidence: number): string {
    if (confidence >= 0.8) return "high";
    if (confidence >= 0.6) return "medium";
    return "low";
  }

  showDetails(result: any) {
    // Implement details modal or navigation
    console.log("Show details for:", result);
  }

  trackByIndex(index: number, item: any): number {
    return index;
  }
}
