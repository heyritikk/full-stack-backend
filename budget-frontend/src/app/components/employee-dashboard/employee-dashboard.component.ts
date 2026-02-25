import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Expense, ExpenseService } from '../../services/expense.service';
import { AuthService } from '../../services/auth.service';
import { BudgetService } from '../../services/budget.service';

interface NotificationItem {
  message: string;
  status: 'Approved' | 'Rejected';
  createdAt: Date;
}

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './employee-dashboard.component.html',
  styleUrl: './employee-dashboard.component.css'
})
export class EmployeeDashboardComponent implements OnInit {

  section: string = 'create-expense';

  expenses: Expense[] = [];
  notifications: NotificationItem[] = [];
  budgets:any[] =[];
  //managers: any[]=[];

  expenseForm!: FormGroup;
  editExpenseForm!: FormGroup;
  isLoadingExpenses = false;
  showEditModal = false;
  selectedExpense: Expense | null = null;

  constructor(
    private expenseService: ExpenseService,
    private budgetService:BudgetService,
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.buildForms();
    this.loadExpenses();
    this.loadBudgets();
    //cd..this.loadManagers();
  }

  buildForms() {
    this.expenseForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      amount: [null, [Validators.required, Validators.min(1)]],
      budgetId: [null, [Validators.required]],
      description: ['', [Validators.maxLength(250)]]
    });

    this.editExpenseForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      amount: [null, [Validators.required, Validators.min(1)]],
      budgetId: [null, [Validators.required]],
      description: ['', [Validators.maxLength(250)]]
    });
  }

  get f() { return this.expenseForm.controls; }

  setSection(name: string) {
    this.section = name;
  }

  loadExpenses() {
    this.isLoadingExpenses = true;
    this.expenseService.getAllExpenses().subscribe({
      next: (res) => {
        this.expenses = res;
        this.isLoadingExpenses = false;
        this.buildNotificationsFromExpenses();
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

    const payload = this.expenseForm.value;

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

  buildNotificationsFromExpenses() {
    this.notifications = this.expenses
      .filter(e => e.status === 'Approved' || e.status === 'Rejected')
      .map(e => ({
        message: e.status === 'Approved'
          ? `Your expense "${e.title}" was approved.`
          : `Your expense "${e.title}" was rejected.`,
        status: e.status as 'Approved' | 'Rejected',
        createdAt: new Date()
      }));
  }

   loadBudgets(){
    
    this.budgetService.getAllBudgets().subscribe
       ((res:any) => {
        console.log("Full Response",res);
        this.budgets = res.data;
        console.log("Budget Array:",this.budgets);
       
      });
      
  }

  

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
