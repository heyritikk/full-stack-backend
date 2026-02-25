import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  // Backend runs on http://localhost:5078 (see launchSettings)
  private baseUrl = 'http://localhost:5078/api';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : ''
    });
  }

  getDepartmentReport(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/report/department`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(err => throwError(() => err))
    );
  }

  getBudgetReport(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/report/budget`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(err => throwError(() => err))
    );
  }

  getSummaryReport(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/report/summary`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(err => throwError(() => err))
    );
  }
}

