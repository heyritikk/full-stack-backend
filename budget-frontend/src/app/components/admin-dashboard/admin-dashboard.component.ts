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

 currentY = this.addTableSection(doc, 'Department Report', this.departmentReport, currentY, pageWidth);
 currentY = this.addTableSection(doc, 'Budget Report', this.budgetReport, currentY, pageWidth);
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



