import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Expense {
 id: number;
 title: string;
 amount: number;
 budgetId: number;
 description?: string;
 employeeName?: string;
 employeeId?: string | number;
 managerEmail?: string;
 managerId?: string | number;
 status: 'Pending' | 'Approved' | 'Rejected' | string;
 /** True when expense amount exceeds remaining budget (for manager warning) */
 exceedsBudget?: boolean;
 /** Remaining budget for this expense's budget (for manager UI) */
 remainingBudget?: number;
}

@Injectable({
 providedIn: 'root'
})
export class ExpenseService {

 // Backend runs on http://localhost:5078 (see launchSettings)
 private baseUrl = 'http://localhost:5078/api';

 constructor(private http: HttpClient) { }

 private getAuthHeaders(): HttpHeaders {
 const token = localStorage.getItem('token');
 return new HttpHeaders({
 Authorization: token ? `Bearer ${token}` : ''
 });
 }

 getAllExpenses(): Observable<Expense[]> {
 return this.http.get<Expense[]>(`${this.baseUrl}/expense`, {
 headers: this.getAuthHeaders()
 });
 }

 createExpense(data: Partial<Expense>): Observable<any> {
 return this.http.post(`${this.baseUrl}/expense/create`, data, {
 headers: this.getAuthHeaders()
 });
 }

 updateExpense(id: number, data: Partial<Expense>): Observable<any> {
 return this.http.patch(`${this.baseUrl}/expense/update/${id}`, data, {
 headers: this.getAuthHeaders()
 });
 }

 updateExpenseStatus(id: number, status: 'Pending' | 'Approved' | 'Rejected' | string): Observable<any> {
 return this.updateExpense(id, { status });
 }

 approveOrRejectExpense(
 id: number,
 action: 'Approve' | 'Reject',
 comment: string = ''
 ): Observable<any> {
 return this.http.patch(
 `${this.baseUrl}/expense/approve-reject/${id}`,
 { action, comment },
 { headers: this.getAuthHeaders() }
 );
 }

 deleteExpense(id: number): Observable<any> {
 return this.http.patch(`${this.baseUrl}/expense/delete/${id}`, {}, {
 headers: this.getAuthHeaders()
 });
 }
}

