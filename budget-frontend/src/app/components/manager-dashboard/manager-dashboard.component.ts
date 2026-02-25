


import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Budget, BudgetService } from '../../services/budget.service';
import { Expense, ExpenseService } from '../../services/expense.service';

interface NotificationItem {
  message: string;
  type: 'expense' | 'budget';
  createdAt: Date;
}

@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './manager-dashboard.component.html',
  styleUrls: ['./manager-dashboard.component.css']
})
export class ManagerDashboardComponent implements OnInit {

  section: string = 'create-budget';

  budgets: Budget[] = [];
  expenses: Expense[] = [];
  notifications: NotificationItem[] = [];

  pendingExpensesCount = 0;

  departments = [
    { departmentId: 1, departmentName: 'HR' },
    { departmentId: 2, departmentName: 'Finance' },
    { departmentId: 3, departmentName: 'IT' }
  ];

  budgetForm!: FormGroup;
  editBudgetForm!: FormGroup;
  showEditModal = false;
  selectedBudget: Budget | null = null;

  isLoadingBudgets = false;
  isLoadingExpenses = false;

  constructor(
    private budgetService: BudgetService,
    private expenseService: ExpenseService,
    private router: Router,
    private fb: FormBuilder,
    private authService: AuthService
  ){}

  ngOnInit(){
    this.buildForms();
    this.loadBudgets();
    this.loadExpenses();
  }

  buildForms() {
    this.budgetForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      amountAllocated: [null, [Validators.required, Validators.min(1)]],
      departmentId: [null, [Validators.required]]
    });

    this.editBudgetForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      amountAllocated: [null, [Validators.required, Validators.min(1)]],
      departmentId: [null, [Validators.required]]
    });
  }

  get f() { return this.budgetForm.controls; }

  setSection(name:string){
    this.section = name;
    if(name === 'view-budgets')
      {
        this.loadBudgets();
    }
  }

  loadBudgets(){
    this.isLoadingBudgets = true;
    this.budgetService.getAllBudgets().subscribe({
      next: (res) => {
        console.log("DATA:",res);
        this.budgets = res.data;
        this.isLoadingBudgets = false;
      },
      error: () => {
        this.isLoadingBudgets = false;
      }
    });
  }

  loadExpenses() {
    this.isLoadingExpenses = true;
    this.expenseService.getAllExpenses().subscribe({
      next: (res) => {
        this.expenses = res;
        this.pendingExpensesCount = this.expenses.filter(e => e.status === 'Pending').length;
        this.isLoadingExpenses = false;
      },
      error: () => {
        this.isLoadingExpenses = false;
      }
    });
  }

  createBudget(){
    if (this.budgetForm.invalid) {
      this.budgetForm.markAllAsTouched();
      return;
    }

    const payload = this.budgetForm.value;

    this.budgetService.createBudget(payload).subscribe({
      next: () => {
        this.pushNotification('Budget created successfully.', 'budget');
        this.loadBudgets();
        this.budgetForm.reset();
        this.section = 'view-budgets';
      },
      error: () => {
        this.pushNotification('Failed to create budget.', 'budget');
      }
    });
  }

  openEditModal(budget: Budget) {
    this.selectedBudget = budget;
    this.editBudgetForm.setValue({
      title: budget.title,
      amountAllocated: budget.amountAllocated,
      departmentId: budget.departmentId
    });
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.selectedBudget = null;
  }

  updateBudget() {
    if (!this.selectedBudget || this.editBudgetForm.invalid) {
      this.editBudgetForm.markAllAsTouched();
      return;
    }

    const payload = this.editBudgetForm.value;

    this.budgetService.updateBudget(this.selectedBudget.budgetId, payload).subscribe({
      next: () => {
        this.pushNotification('Budget updated successfully.', 'budget');
        this.loadBudgets();
        this.closeEditModal();
      },
      error: () => {
        this.pushNotification('Failed to update budget.', 'budget');
      }
    });
  }

  deleteBudget(budgetId:number){
    if (!confirm('Are you sure you want to delete this budget?')) {
      return;
    }
    this.budgetService.deleteBudget(budgetId).subscribe(()=>{
      this.pushNotification('Budget deleted.', 'budget');
      this.loadBudgets();
    });
  }

  approveExpense(expense: Expense) {
    this.expenseService.updateExpenseStatus(expense.id, 'Approved').subscribe({
      next: () => {
        this.pushNotification(`Expense "${expense.title}" approved.`, 'expense');
        this.loadExpenses();
      },
      error: () => {
        this.pushNotification(`Failed to approve expense "${expense.title}".`, 'expense');
      }
    });
  }

  rejectExpense(expense: Expense) {
    this.expenseService.updateExpenseStatus(expense.id, 'Rejected').subscribe({
      next: () => {
        this.pushNotification(`Expense "${expense.title}" rejected.`, 'expense');
        this.loadExpenses();
      },
      error: () => {
        this.pushNotification(`Failed to reject expense "${expense.title}".`, 'expense');
      }
    });
  }

  pushNotification(message: string, type: 'expense' | 'budget') {
    this.notifications.unshift({
      message,
      type,
      createdAt: new Date()
    });
  }

  logout(){
    this.authService.logout();
    this.router.navigate(['/login']);
  }

}