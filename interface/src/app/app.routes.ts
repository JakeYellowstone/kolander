import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AnalysisComponent } from './pages/analysis/analysis.component';
import { ConfigComponent } from './pages/config/config.component';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'analysis', component: AnalysisComponent },
  { path: 'config', component: ConfigComponent },
];