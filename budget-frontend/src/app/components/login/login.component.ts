import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

/**
 * Login Page - Matches backend API:
 * POST /api/users/login with { email, password }
 * Returns: { token, userId, email, role }
 * Errors: 401 - "Invalid username or password" or "Please verify your email first"
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private apiService: ApiService,
    private router: Router,
    private authService: AuthService
  ) {}

  onSubmit() {
    this.errorMessage = '';

    if (!this.email?.trim()) {
      this.errorMessage = 'Please enter your email';
      return;
    }

    if (!this.password?.trim()) {
      this.errorMessage = 'Please enter your password';
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.errorMessage = 'Please enter a valid email address';
      return;
    }

    this.isLoading = true;

    this.apiService.login({
      email: this.email.trim().toLowerCase(),
      password: this.password
    }).subscribe({
      next: (response) => {
        this.authService.setSession(response.token, response.email, response.role, response.userId);
        this.isLoading = false;
     if(response.role === 'Manager') {
         console.log("Inside manager dashboard navigation");
          this.router.navigate(['/manager-dashboard']);
        } else if(response.role === 'Employee') {
          this.router.navigate(['/employee-dashboard']);
        }
      },
      error: (error) => {
        this.errorMessage = this.apiService.getErrorMessage(error, 'Invalid email or password');
        this.isLoading = false;
      }
    });
  }

  navigateToRegister() {
    this.router.navigate(['/register']);
  }

  navigateToHome() {
    this.router.navigate(['/']);
  }
}
