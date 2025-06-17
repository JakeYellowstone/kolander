import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { DetailModalComponent } from "../modal_détails/details.component";

@Component({
  selector: "app-results-table",
  standalone: true,
  templateUrl: "results-table.component.html",
  styleUrl: "./results-table.component.css",
  imports: [CommonModule, DetailModalComponent, FormsModule],
})
export class ResultsTableComponent implements OnInit, OnChanges {
  @Input() results: any[] = [];
  @Input() totalProcessed: number = 0;
  @Input() threatsDetected: number = 0;

  filteredResults: any[] = [];
  searchFilteredResults: any[] = [];
  paginatedResults: any[] = [];
  selectedPriority = "all";
  searchTerm = "";
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
    this.searchTerm = "";
    this.currentPage = 1;
    this.applyFilters();
  }

  filterByPriority(priority: string) {
    this.selectedPriority = priority;
    this.currentPage = 1; // Retour à la première page lors du changement de filtre
    this.applyFilters();
  }

  onSearchChange() {
    this.currentPage = 1; // Retour à la première page lors de la recherche
    this.applyFilters();
  }

  clearSearch() {
    this.searchTerm = "";
    this.currentPage = 1;
    this.applyFilters();
  }

  private applyFilters() {
    // Étape 1: Appliquer le filtre de priorité
    if (this.selectedPriority === "all") {
      this.filteredResults = [...this.results];
    } else {
      this.filteredResults = this.results.filter(
        (result) => result.finalPriority === this.selectedPriority
      );
    }

    // Étape 2: Appliquer le filtre de recherche sur les résultats filtrés par priorité
    if (this.searchTerm.trim() === "") {
      this.searchFilteredResults = [...this.filteredResults];
    } else {
      this.searchFilteredResults = this.applySearchFilter(this.filteredResults);
    }

    // Étape 3: Trier par score de priorité (décroissant)
    this.searchFilteredResults.sort((a, b) => b.priorityScore - a.priorityScore);

    // Étape 4: Recalculer la pagination
    this.updatePagination();
  }

  private applySearchFilter(results: any[]): any[] {
    const searchLower = this.searchTerm.toLowerCase().trim();
    
    return results.filter((result) => {
      // Recherche dans tous les champs visibles du tableau
      const searchableFields = [
        result.id?.toString() || '',
        result.group || '',
        result.hostname || '',
        result.username || '',
        result.process_name || '',
        result.path || '',
        result.alert_severity || '',
        result.finalPriority || '',
        result.cmdline || '',
        result.parent_name || '',
        result.sensor_id?.toString() || '',
        result.process_pid?.toString() || '',
        result.parent_pid?.toString() || '',
        result.ioc_type || '',
        result.ioc_value || '',
        result.feed_name || '',
        (result.confidence * 100).toFixed(1) || '',
        (result.priorityScore * 100).toFixed(0) || '',
        result.groupMultiplier?.toString() || '',
        result.childproc_count?.toString() || '',
        result.netconn_count?.toString() || '',
        result.filemod_count?.toString() || ''
      ];

      // Vérifier si le terme de recherche est présent dans au moins un champ
      return searchableFields.some(field => 
        field.toLowerCase().includes(searchLower)
      );
    });
  }

  private updatePagination() {
    // Calculer le nombre total de pages basé sur les résultats après recherche
    this.totalPages = Math.ceil(this.searchFilteredResults.length / this.itemsPerPage);
    
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
    this.paginatedResults = this.searchFilteredResults.slice(startIndex, endIndex);
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

  getFilteredCount(): number {
    // Retourner le nombre d'éléments après filtrage par priorité et recherche
    return this.searchFilteredResults.length;
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

  // Méthodes utilitaires pour l'affichage
  hasSearchResults(): boolean {
    return this.searchFilteredResults.length > 0;
  }

  isSearchActive(): boolean {
    return this.searchTerm.trim().length > 0;
  }

  getSearchResultsText(): string {
    if (!this.isSearchActive()) {
      return '';
    }
    
    const count = this.searchFilteredResults.length;
    return count === 0 
      ? `Aucun résultat pour "${this.searchTerm}"`
      : `${count} résultat${count > 1 ? 's' : ''} pour "${this.searchTerm}"`;
  }
}