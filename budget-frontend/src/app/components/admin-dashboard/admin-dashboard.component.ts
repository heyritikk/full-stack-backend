import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ReportService } from '../../services/report.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {

  section: 'dashboard' | 'reports' | 'system' = 'dashboard';

  departmentReport: any[] = [];
  budgetReport: any[] = [];
  summaryReport: any[] = [];

  isLoadingDepartment = false;
  isLoadingBudget = false;
  isLoadingSummary = false;

  departmentError = '';
  budgetError = '';
  summaryError = '';

  loggedInEmail: string | null = null;

  objectKeys = Object.keys;

  constructor(
    private authService: AuthService,
    private reportService: ReportService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loggedInEmail = this.authService.getEmail();
    this.loadReports();
  }

  get displayName(): string {
    if (!this.loggedInEmail) {
      return 'Admin';
    }
    const [name] = this.loggedInEmail.split('@');
    return name || this.loggedInEmail;
  }

  setSection(section: 'dashboard' | 'reports' | 'system') {
    this.section = section;
  }

  private loadReports() {
    this.loadDepartmentReport();
    this.loadBudgetReport();
    this.loadSummaryReport();
  }

  private loadDepartmentReport() {
    this.isLoadingDepartment = true;
    this.departmentError = '';
    this.reportService.getDepartmentReport().subscribe({
      next: (data) => {
        this.departmentReport = data || [];
        this.isLoadingDepartment = false;
      },
      error: () => {
        this.departmentError = 'Failed to load department report.';
        this.isLoadingDepartment = false;
      }
    });
  }

  private loadBudgetReport() {
    this.isLoadingBudget = true;
    this.budgetError = '';
    this.reportService.getBudgetReport().subscribe({
      next: (data) => {
        this.budgetReport = data || [];
        this.isLoadingBudget = false;
      },
      error: () => {
        this.budgetError = 'Failed to load budget report.';
        this.isLoadingBudget = false;
      }
    });
  }

  private loadSummaryReport() {
    this.isLoadingSummary = true;
    this.summaryError = '';
    this.reportService.getSummaryReport().subscribe({
      next: (data) => {
        this.summaryReport = data || [];
        this.isLoadingSummary = false;
      },
      error: () => {
        this.summaryError = 'Failed to load summary report.';
        this.isLoadingSummary = false;
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

