import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private storage = localStorage; // use localStorage for persistence

  getToken(): string | null {
    return this.storage.getItem('token');
  }

  getRole(): string | null {
    const storedRole = this.storage.getItem('role');
    if (storedRole) {
      return storedRole;
    }

    // Fallback: try to read role from JWT if not explicitly stored
    const token = this.getToken();
    if (!token) {
      return null;
    }

    try {
      const payloadPart = token.split('.')[1];
      const decoded = JSON.parse(atob(payloadPart));
      return decoded['role'] || decoded['Role'] || null;
    } catch {
      return null;
    }
  }

  getEmail(): string | null {
    return this.storage.getItem('email');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  setSession(token: string, email: string, role: string, userId?: string) {
    this.storage.setItem('token', token);
    this.storage.setItem('email', email);
    this.storage.setItem('role', role);
    if (userId) {
      this.storage.setItem('userId', userId);
    }
  }

  clearSession() {
    this.storage.removeItem('token');
    this.storage.removeItem('email');
    this.storage.removeItem('role');
    this.storage.removeItem('userId');
  }

  logout() {
    this.clearSession();
  }
}

