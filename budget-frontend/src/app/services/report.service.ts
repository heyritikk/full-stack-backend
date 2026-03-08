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

 getDepartmentReport(params?: { startDate?: string; endDate?: string }): Observable<any[]> {
 const searchParams = new URLSearchParams();
 if (params?.startDate) searchParams.set('startDate', params.startDate);
 if (params?.endDate) searchParams.set('endDate', params.endDate);
 const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
 return this.http.get<any[]>(`${this.baseUrl}/report/department${query}`, {
 headers: this.getAuthHeaders()
 }).pipe(
 catchError(err => throwError(() => err))
 );
 }

 getBudgetReport(params?: { startDate?: string; endDate?: string }): Observable<any[]> {
 const searchParams = new URLSearchParams();
 if (params?.startDate) searchParams.set('startDate', params.startDate);
 if (params?.endDate) searchParams.set('endDate', params.endDate);
 const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
 return this.http.get<any[]>(`${this.baseUrl}/report/budget${query}`, {
 headers: this.getAuthHeaders()
 }).pipe(
 catchError(err => throwError(() => err))
 );
 }

 getSummaryReport(params?: { startDate?: string; endDate?: string }): Observable<any[]> {
 const searchParams = new URLSearchParams();
 if (params?.startDate) searchParams.set('startDate', params.startDate);
 if (params?.endDate) searchParams.set('endDate', params.endDate);
 const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
 return this.http.get<any[]>(`${this.baseUrl}/report/summary${query}`, {
 headers: this.getAuthHeaders()
 }).pipe(
 catchError(err => throwError(() => err))
 );
 }
}


