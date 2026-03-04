import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AppNotification {
 notificationId: number;
 toUserId: number;
 type: string | number;
 message: string;
 status: 'Read' | 'Unread' | string | number;
 createdDate: string;
}

export interface NotificationsResponse {
 status: number;
 unreadCount: number;
 data: AppNotification[];
}

@Injectable({
 providedIn: 'root'
})
export class NotificationService {
 private baseUrl = 'http://localhost:5078/api/notifications';

 constructor(private http: HttpClient) {}

 private getAuthHeaders(): HttpHeaders {
 const token = localStorage.getItem('token');
 return new HttpHeaders({
 Authorization: token ? `Bearer ${token}` : ''
 });
 }

 getNotifications(): Observable<NotificationsResponse> {
 return this.http.get<NotificationsResponse>(this.baseUrl, {
 headers: this.getAuthHeaders()
 });
 }

 markAsRead(notificationId: number): Observable<{ status: number; message: string }> {
 return this.http.patch<{ status: number; message: string }>(
 `${this.baseUrl}/read/${notificationId}`,
 {},
 { headers: this.getAuthHeaders() }
 );
 }
}

