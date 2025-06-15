import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { DetailModalComponent } from "../modal_détails/details.component";

@Component({
  selector: "app-results-table",
  standalone: true,
  templateUrl: "results-table.component.html",
  styleUrl: "./results-table.component.css",
  imports: [CommonModule, DetailModalComponent],
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

  // Gestion boite modal
  modalVisible = false;
  menace: any = null;

  handleCancel(): void {
    this.modalVisible = false;
    this.menace = null;
  }

  ngOnInit() {
    this.initializeData();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes["results"] && changes["results"].currentValue) {
      this.initializeData();
    }
  }

  private initializeData() {
    // Réinitialiser à la première page et au filtre "all"
    this.selectedPriority = "all";
    this.currentPage = 1;
    this.applyFilter();
  }

  filterByPriority(priority: string) {
    this.selectedPriority = priority;
    this.currentPage = 1; // Retour à la première page lors du changement de filtre
    this.applyFilter();
  }

  private applyFilter() {
    // Appliquer le filtre sur les résultats complets
    if (this.selectedPriority === "all") {
      this.filteredResults = [...this.results];
    } else {
      this.filteredResults = this.results.filter(
        (result) => result.finalPriority === this.selectedPriority
      );
    }

    // Trier par score de priorité (décroissant)
    this.filteredResults.sort((a, b) => b.priorityScore - a.priorityScore);

    // Recalculer la pagination
    this.updatePagination();
  }

  private updatePagination() {
    // Calculer le nombre total de pages
    this.totalPages = Math.ceil(this.filteredResults.length / this.itemsPerPage);
    
    // S'assurer que la page courante est valide
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    }
    if (this.currentPage < 1) {
      this.currentPage = 1;
    }

    // Calculer les indices de début et fin pour la pagination
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    
    // Extraire les éléments pour la page courante
    this.paginatedResults = this.filteredResults.slice(startIndex, endIndex);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
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
    // Toujours calculer sur la base des résultats complets, pas des résultats filtrés
    return this.results.filter((result) => result.finalPriority === priority).length;
  }

  getTotalCount(): number {
    // Retourner toujours le nombre total d'alertes détectées
    return this.results.length;
  }

  getConfidenceClass(confidence: number): string {
    if (confidence >= 0.8) return "high";
    if (confidence >= 0.6) return "medium";
    return "low";
  }

  showDetails(result: any) {
    this.modalVisible = true;
    this.menace = result;
    console.log("Show details for:", result);
  }

  trackByIndex(index: number, item: any): number {
    return item.id || index;
  }
}