// import { Component } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { Router } from '@angular/router';
// import { ApiService, Department } from '../../services/api.service';

// export type SignUpRole = 'Manager' | 'Employee';

// /**
// * Registration Page - Matches backend API:
// * POST /api/users/register-employee or register-manager with { name, email, password }
// * Returns: { message: "..." }
// */
// @Component({
// selector: 'app-register',
// standalone: true,
// imports: [CommonModule, FormsModule],
// templateUrl: './register.component.html',
// styleUrl: './register.component.css'
// })
// export class RegisterComponent {
// name: string = '';
// email: string = '';
// password: string = '';
// departmentId: number = 0;
// selectedRole: SignUpRole = 'Employee';
// // Hard-coded departments for signup dropdown (must exist in DB with these IDs)
// departments: Department[] = [
// { departmentId: 1, departmentName: 'Sales' },
// { departmentId: 2, departmentName: 'IT' },
// { departmentId: 3, departmentName: 'Finance' }
// ];
// isLoading: boolean = false;
// errorMessage: string = '';
// successMessage: string = '';

// constructor(
// private apiService: ApiService,
// private router: Router
// ) {}

// onSubmit() {
// this.errorMessage = '';
// this.successMessage = '';

// if (!this.name?.trim()) {
// this.errorMessage = 'Please enter your full name';
// return;
// }

// if (!this.email?.trim()) {
// this.errorMessage = 'Please enter your email';
// return;
// }

// if (!this.password?.trim()) {
// this.errorMessage = 'Please enter a password';
// return;
// }

// if (this.selectedRole === 'Employee' && (!this.departmentId || this.departmentId === 0)) {
// this.errorMessage = 'Please select a department';
// return;
// }

// if (this.password.length < 6) {
// this.errorMessage = 'Password must be at least 6 characters';
// return;
// }

// const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// if (!emailRegex.test(this.email)) {
// this.errorMessage = 'Please enter a valid email address';
// return;
// }

// this.isLoading = true;

// const payload = {
// name: this.name.trim(),
// email: this.email.trim().toLowerCase(),
// password: this.password,
// ...(this.selectedRole === 'Employee' ? { departmentId: this.departmentId } : { departmentId: null })
// };

// const request$ = this.selectedRole === 'Manager'
// ? this.apiService.registerManager(payload)
// : this.apiService.registerEmployee(payload);

// request$.subscribe({
// next: (response) => {
// this.successMessage = response.message;
// this.isLoading = false;
// setTimeout(() => this.router.navigate(['/login']), 3000);
// },
// error: (error) => {
// console.error('Full error:', error);
// console.error('Backend message:', error?.error?.message ?? error?.error);
// this.errorMessage = this.apiService.getErrorMessage(error, 'Registration failed. Please try again.');
// this.isLoading = false;
// }
// });
// }

// navigateToLogin() {
// this.router.navigate(['/login']);
// }

// navigateToHome() {
// this.router.navigate(['/']);
// }
// }
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
 
@Component({
 selector: 'app-register',
 standalone: true,
 imports: [CommonModule, FormsModule],
 templateUrl: './register.component.html',
 styleUrl: './register.component.css'
})
export class RegisterComponent {
 
 name: string = '';
 email: string = '';
 password: string = '';
 departmentId: number=0 ;
  selectedRole: string = ''; // IMPORTANT (no default)
 
 isLoading: boolean = false;
 errorMessage: string = '';
 successMessage: string = '';
 
 departments = [
 { departmentId: 1, departmentName: 'IT' },
 { departmentId: 2, departmentName: 'HR' },
 { departmentId: 3, departmentName: 'Finance' }
 ];
 
 constructor(
 private apiService: ApiService,
 private router: Router
 ) {}
 
 onSubmit() {
 
 this.errorMessage = '';
 this.successMessage = '';
 
    // Name validation
 if (!this.name.trim()) {
 this.errorMessage = 'Please enter your full name';
 return;
 }
 
    // Email validation
 if (!this.email.trim()) {
 this.errorMessage = 'Please enter your email';
 return;
 }
 
 const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
 if (!emailRegex.test(this.email)) {
 this.errorMessage = 'Please enter a valid email address';
 return;
 }
 
    // Password validation
 if (!this.password.trim()) {
 this.errorMessage = 'Please enter a password';
 return;
 }
 
 if (this.password.length < 6) {
 this.errorMessage = 'Password must be at least 6 characters';
 return;
 }
 
    // Role validation
 if (!this.selectedRole) {
 this.errorMessage = 'Please select a role';
 return;
 }
 
    // Department required only for Employee
 if (!this.departmentId) {
 this.errorMessage = 'Please select a department';
 return;
 }
 
 this.isLoading = true;
 
 const payload: any = {
 name: this.name.trim(),
 email: this.email.trim().toLowerCase(),
 password: this.password,
 departmentId: this.departmentId
 };
 

 console.log("Role:",this.selectedRole);
 console.log("Department ID:", this.departmentId);
 
    // Role based API call
 const request$ =
 this.selectedRole === 'Manager'
 ? this.apiService.registerManager(payload)
 : this.apiService.registerEmployee(payload);
 
 request$.subscribe({
 next: (response: any) => {
 this.successMessage = response?.message || 'Registration successful';
 this.isLoading = false;
 
 setTimeout(() => {
 this.router.navigate(['/login']);
 }, 2000);
 },
 error: (error) => {
 console.error(error);
 this.errorMessage =
 error?.error?.message || 'Registration failed';
 this.isLoading = false;
 }
 });
 }
 
 navigateToLogin() {
 this.router.navigate(['/login']);
 }
 
 navigateToHome() {
 this.router.navigate(['/']);
 }
}
 

