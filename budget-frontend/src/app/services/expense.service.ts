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
  status: 'Pending' | 'Approved' | 'Rejected' | string;
}

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {

  private baseUrl = 'https://localhost:7268/api';

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

  deleteExpense(id: number): Observable<any> {
    return this.http.patch(`${this.baseUrl}/expense/delete/${id}`, {}, {
      headers: this.getAuthHeaders()
    });
  }
}
