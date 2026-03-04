import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Expense, ExpenseService } from '../../services/expense.service';
import { AuthService } from '../../services/auth.service';
import { BudgetService } from '../../services/budget.service';
import { ApiService, UserSummary } from '../../services/api.service';
import { NotificationService, AppNotification } from '../../services/notification.service';

interface NotificationItem {
 notificationId: number;
 type: string;
 message: string;
 readStatus: 'Read' | 'Unread';
 createdAt: Date;
 isLocal?: boolean;
}

interface EmployeeBudgetItem {
 budgetId: number;
 title: string;
 createdByUserId?: number;
}

@Component({
 selector: 'app-employee-dashboard',
 standalone: true,
 imports: [CommonModule, ReactiveFormsModule],
 templateUrl: './employee-dashboard.component.html',
 styleUrls: ['./employee-dashboard.component.css']
})
export class EmployeeDashboardComponent implements OnInit {

 section: string = 'create-expense';
 isSidebarOpen = true;

 expenses: Expense[] = [];
notifications: NotificationItem[] = [];
 unreadNotificationsCount = 0;
 budgets: EmployeeBudgetItem[] = [];
 managers: UserSummary[] = [];

 expenseForm!: FormGroup;
 editExpenseForm!: FormGroup;
 isLoadingExpenses = false;
 showEditModal = false;
 selectedExpense: Expense | null = null;

 loggedInEmail: string | null = null;

 constructor(
 private expenseService: ExpenseService,
 private budgetService:BudgetService,
 private authService: AuthService,
 private router: Router,
 private fb: FormBuilder,
 private apiService: ApiService,
 private notificationService: NotificationService
 ) {}

 ngOnInit(): void {
 this.loggedInEmail = this.authService.getEmail();
 this.buildForms();
 this.setupBudgetManagerBinding();
 this.loadExpenses();
 this.loadBudgets();
 this.loadManagers();
 this.loadNotifications();
 }

 buildForms() {
 this.expenseForm = this.fb.group({
 title: ['', [Validators.maxLength(100)]],
 amount: [null, [Validators.required, Validators.min(1)]],
 budgetId: [null, [Validators.required]],
 description: ['', [Validators.maxLength(250)]],
 managerId: [null, [Validators.required]]
 });

 this.editExpenseForm = this.fb.group({
 title: ['', [Validators.required, Validators.maxLength(100)]],
 amount: [null, [Validators.required, Validators.min(1)]],
 budgetId: [null, [Validators.required]],
 description: ['', [Validators.maxLength(250)]]
 });
 }

 get f() { return this.expenseForm.controls; }

 get displayName(): string {
 if (!this.loggedInEmail) {
 return 'Employee';
 }
 const [name] = this.loggedInEmail.split('@');
 return name || this.loggedInEmail;
 }

 setSection(name: string) {
 this.section = name;
 if (name === 'notifications') {
 this.loadNotifications();
 }
 }

 toggleSidebar() {
 this.isSidebarOpen = !this.isSidebarOpen;
 }

 get selectedBudgetCreatorId(): number | null {
 const selectedBudgetId = this.expenseForm?.get('budgetId')?.value;
 if (!selectedBudgetId) {
 return null;
 }
 const budget = this.budgets.find(b => Number(b.budgetId) === Number(selectedBudgetId));
 return budget?.createdByUserId ? Number(budget.createdByUserId) : null;
 }

 get filteredManagers(): UserSummary[] {
 const creatorId = this.selectedBudgetCreatorId;
 if (!creatorId) {
 return [];
 }
 return this.managers.filter(m => Number(m.userId) === creatorId);
 }

 loadExpenses() {
 this.isLoadingExpenses = true;
 this.expenseService.getAllExpenses().subscribe({
 next: (res) => {
 this.expenses = res;
 this.isLoadingExpenses = false;
 },
 error: () => {
 this.isLoadingExpenses = false;
 }
 });
 }

 createExpense() {
 if (this.expenseForm.invalid) {
 this.expenseForm.markAllAsTouched();
 return;
 }

 const payload = { ...this.expenseForm.value };
 if (!payload.title) {
 payload.title = payload.description || 'Expense';
 }

 this.expenseService.createExpense(payload).subscribe({
 next: () => {
 this.loadExpenses();
 this.expenseForm.reset();
 this.section = 'view-expenses';
 },
 error: () => {
 // optional: surface error to user
 }
 });
 }

 openEditModal(expense: Expense) {
 this.selectedExpense = expense;
 this.editExpenseForm.setValue({
 title: expense.title,
 amount: expense.amount,
 budgetId: expense.budgetId,
 description: expense.description || ''
 });
 this.showEditModal = true;
 }

 closeEditModal() {
 this.showEditModal = false;
 this.selectedExpense = null;
 }

 updateExpense() {
 if (!this.selectedExpense || this.editExpenseForm.invalid) {
 this.editExpenseForm.markAllAsTouched();
 return;
 }

 const payload = this.editExpenseForm.value;

 this.expenseService.updateExpense(this.selectedExpense.id, payload).subscribe({
 next: () => {
 this.loadExpenses();
 this.closeEditModal();
 },
 error: () => {
 // optional: surface error
 }
 });
 }

 deleteExpense(id: number) {
 if (!confirm('Are you sure you want to delete this expense?')) {
 return;
 }

 this.expenseService.deleteExpense(id).subscribe({
 next: () => {
 this.loadExpenses();
 }
 });
 }

 private normalizeReadStatus(value: string | number | null | undefined): 'Read' | 'Unread' {
 if (value === 1 || String(value).toLowerCase() === 'read') {
 return 'Read';
 }
 return 'Unread';
 }

 private mapNotificationType(type: string | number): string {
 if (typeof type === 'string') {
 return type;
 }
 if (type === 0) return 'ExpenseApproval';
 if (type === 1) return 'ExpenseRejected';
 if (type === 2) return 'ExpensePending';
 return 'Notification';
 }

 loadNotifications() {
 this.notificationService.getNotifications().subscribe({
 next: (res) => {
 const list = res?.data ?? [];
 this.notifications = list.map((n: AppNotification) => ({
 notificationId: n.notificationId,
 type: this.mapNotificationType(n.type),
 message: n.message,
 readStatus: this.normalizeReadStatus(n.status),
 createdAt: n.createdDate ? new Date(n.createdDate) : new Date()
 }));
 this.unreadNotificationsCount = this.notifications.filter(n => n.readStatus === 'Unread').length;
 },
 error: () => {
 this.notifications = [];
 this.unreadNotificationsCount = 0;
 }
 });
 }

 markNotificationAsRead(notification: NotificationItem) {
 if (notification.readStatus === 'Read') {
 return;
 }

 if (notification.isLocal || !notification.notificationId) {
 notification.readStatus = 'Read';
 this.unreadNotificationsCount = this.notifications.filter(n => n.readStatus === 'Unread').length;
 return;
 }

 this.notificationService.markAsRead(notification.notificationId).subscribe({
 next: () => {
 notification.readStatus = 'Read';
 this.unreadNotificationsCount = this.notifications.filter(n => n.readStatus === 'Unread').length;
 },
 error: () => {
 // keep previous status on failure
 }
 });
 }

 setupBudgetManagerBinding() {
 this.expenseForm.get('budgetId')?.valueChanges.subscribe((budgetId) => {
 this.syncManagerWithSelectedBudget(budgetId);
 });
 }

 syncManagerWithSelectedBudget(budgetId: number | string | null) {
 const selected = this.budgets.find(b => Number(b.budgetId) === Number(budgetId));
 const creatorId = selected?.createdByUserId ? Number(selected.createdByUserId) : null;
 const managerControl = this.expenseForm.get('managerId');

 if (!managerControl) {
 return;
 }

 if (!creatorId) {
 managerControl.setValue(null, { emitEvent: false });
 return;
 }

 if (Number(managerControl.value) !== creatorId) {
 managerControl.setValue(creatorId, { emitEvent: false });
 }
 }

 loadManagers() {
 this.apiService.getManagers().subscribe({
 next: (res) => {
 this.managers = res || [];
 },
 error: () => {
 this.managers = [];
 }
 });
 }

 loadBudgets(){
 
 this.budgetService.getAllBudgets().subscribe
 ((res:any) => {
 console.log("Full Response",res);
 this.budgets = res.data;
 this.syncManagerWithSelectedBudget(this.expenseForm.get('budgetId')?.value);
 console.log("Budget Array:",this.budgets);
 
 });
 
 }

 

 logout() {
 this.authService.logout();
 this.router.navigate(['/login']);
 }
}


