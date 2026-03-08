import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ReportService } from '../../services/report.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
 selector: 'app-admin-dashboard',
 standalone: true,
 imports: [CommonModule],
 templateUrl: './admin-dashboard.component.html',
 styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {

 selectedMenu: 'overview' | 'department' | 'budget' | 'summary' = 'overview';
 isSidebarOpen = true;

 departmentReport: any[] = [];
 budgetReport: any[] = [];
 summaryReport: any[] = [];

 isLoadingDepartment = false;
 isLoadingBudget = false;
 isLoadingSummary = false;

 departmentError = '';
 budgetError = '';
 summaryError = '';
 selectedDepartmentFilter = 'All';
 selectedDateFilter = 'all';

 dateFilterOptions: { value: string; label: string }[] = [
 { value: 'all', label: 'All time' },
 { value: '7d', label: 'Last 7 days' },
 { value: '30d', label: 'Last 30 days' },
 { value: '90d', label: 'Last 90 days' },
 { value: 'thisMonth', label: 'This month' },
 { value: 'lastMonth', label: 'Last month' }
 ];

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

 setSection(section: 'overview' | 'department' | 'budget' | 'summary') {
 this.selectedMenu = section;
 }

 onDepartmentFilterChange(event: Event) {
 const target = event.target as HTMLSelectElement | null;
 this.selectedDepartmentFilter = target?.value || 'All';
 }

 onDateFilterChange(event: Event) {
 const target = event.target as HTMLSelectElement | null;
 this.selectedDateFilter = target?.value || 'all';
 this.loadReports();
 }

 private getDateRange(): { startDate?: string; endDate?: string } {
 const now = new Date();
 const end = new Date(now);
 end.setHours(23, 59, 59, 999);

 switch (this.selectedDateFilter) {
 case '7d': {
 const start = new Date(now);
 start.setDate(start.getDate() - 7);
 start.setHours(0, 0, 0, 0);
 return { startDate: start.toISOString().split('T')[0], endDate: end.toISOString().split('T')[0] };
 }
 case '30d': {
 const start = new Date(now);
 start.setDate(start.getDate() - 30);
 start.setHours(0, 0, 0, 0);
 return { startDate: start.toISOString().split('T')[0], endDate: end.toISOString().split('T')[0] };
 }
 case '90d': {
 const start = new Date(now);
 start.setDate(start.getDate() - 90);
 start.setHours(0, 0, 0, 0);
 return { startDate: start.toISOString().split('T')[0], endDate: end.toISOString().split('T')[0] };
 }
 case 'thisMonth': {
 const start = new Date(now.getFullYear(), now.getMonth(), 1);
 return { startDate: start.toISOString().split('T')[0], endDate: end.toISOString().split('T')[0] };
 }
 case 'lastMonth': {
 const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
 const lastEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
 return { startDate: start.toISOString().split('T')[0], endDate: lastEnd.toISOString().split('T')[0] };
 }
 default:
 return {};
 }
 }

 get availableDepartments(): string[] {
 const names = new Set<string>();

 for (const row of this.departmentReport) {
 const name = this.extractDepartmentName(row);
 if (name) names.add(name);
 }
 for (const row of this.budgetReport) {
 const name = this.extractDepartmentName(row);
 if (name) names.add(name);
 }

 return Array.from(names).sort((a, b) => a.localeCompare(b));
 }

 get filteredDepartmentReport(): any[] {
 if (this.selectedDepartmentFilter === 'All') return this.departmentReport;
 return this.departmentReport.filter(r => this.extractDepartmentName(r) === this.selectedDepartmentFilter);
 }

 get filteredBudgetReport(): any[] {
 if (this.selectedDepartmentFilter === 'All') return this.budgetReport;
 return this.budgetReport.filter(r => this.extractDepartmentName(r) === this.selectedDepartmentFilter);
 }

 toggleSidebar() {
 this.isSidebarOpen = !this.isSidebarOpen;
 }

 scrollToSection(sectionId: string, menu: 'overview' | 'department' | 'budget' | 'summary') {
 this.selectedMenu = menu;
 const element = document.getElementById(sectionId);
 if (element) {
 element.scrollIntoView({ behavior: 'smooth', block: 'start' });
 }
 }

 downloadPdf() {
 const doc = new jsPDF('p', 'pt', 'a4');
 const pageWidth = doc.internal.pageSize.getWidth();

 doc.setFontSize(18);
 doc.text('Planera Admin Report', 40, 40);
 doc.setFontSize(11);
 doc.text(`Generated on: ${new Date().toLocaleString()}`, 40, 58);

 let currentY = 84;

 currentY = this.addTableSection(doc, 'Department Report', this.filteredDepartmentReport, currentY, pageWidth);
 currentY = this.addTableSection(doc, 'Budget Report', this.filteredBudgetReport, currentY, pageWidth);
 this.addTableSection(doc, 'Summary Report', this.summaryReport, currentY, pageWidth);

 doc.save('planera-admin-report.pdf');
 }

 private addTableSection(doc: jsPDF, title: string, data: any[], startY: number, pageWidth: number): number {
 const sectionSpacing = 26;

 if (startY > 730) {
 doc.addPage();
 startY = 50;
 }

 doc.setFontSize(13);
 doc.text(title, 40, startY);

 if (!data || !data.length) {
 doc.setFontSize(10);
 doc.text('No data available.', 40, startY + 16);
 return startY + sectionSpacing + 16;
 }

 const keys = this.objectKeys(data[0]);
 const head = [keys.map((key) => this.toTitleCase(key))];
 const body = data.map((row) =>
 keys.map((key) => {
 const value = row[key];
 if (value === null || value === undefined) return '-';
 return String(value);
 })
 );

 autoTable(doc, {
 startY: startY + 10,
 head,
 body,
 margin: { left: 40, right: 40 },
 styles: { fontSize: 9, cellPadding: 5, overflow: 'linebreak' },
 headStyles: { fillColor: [31, 73, 89], textColor: 255 },
 alternateRowStyles: { fillColor: [245, 247, 250] },
 tableWidth: pageWidth - 80
 });

 // `lastAutoTable` is added by jspdf-autotable at runtime.
 const finalY = (doc as any).lastAutoTable?.finalY ?? startY + 24;
 return finalY + sectionSpacing;
 }

 private toTitleCase(value: string): string {
 return value
 .replace(/([A-Z])/g, ' $1')
 .replace(/[_-]+/g, ' ')
 .replace(/\s+/g, ' ')
 .trim()
 .replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase());
 }

 private extractDepartmentName(row: any): string {
 if (!row || typeof row !== 'object') return '';
 return String(
 row.departmentName ??
 row.DepartmentName ??
 row.department ??
 row.Department ??
 ''
 ).trim();
 }

 private loadReports() {
 this.loadDepartmentReport();
 this.loadBudgetReport();
 this.loadSummaryReport();
 }

 private loadDepartmentReport() {
 this.isLoadingDepartment = true;
 this.departmentError = '';
 const params = this.getDateRange();
 this.reportService.getDepartmentReport(params).subscribe({
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
 const params = this.getDateRange();
 this.reportService.getBudgetReport(params).subscribe({
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
 const params = this.getDateRange();
 this.reportService.getSummaryReport(params).subscribe({
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



