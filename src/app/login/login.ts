// login.ts
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PruebaServices } from '../services/prueba.services';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,MatIconModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})

export class Login {
  loginForm: FormGroup;
  registerForm: FormGroup;
  isLoginMode = true;
  isLoading = false;
  errorMessage = '';
  showLoginPassword = false;
  showRegisterPassword = false;

  constructor(
    private fb: FormBuilder,
    private pruebaServices: PruebaServices,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.registerForm = this.fb.group({
      nombre: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rol: ['alumno']
    });
  }

  onLogin() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      this.pruebaServices.login(this.loginForm.value).subscribe({
        next: (response) => {
          this.isLoading = false;
          localStorage.setItem('access_token', response.access_token);

          console.log('Token guardado:', localStorage.getItem('access_token'));

          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.detail || 'Error al iniciar sesión';
          console.error('Login error:', error);
        }
      });
    }
  }

  onRegister() {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      this.pruebaServices.register(this.registerForm.value).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.errorMessage = '';
          // Cambiar a modo login después del registro exitoso
          this.isLoginMode = true;
          this.loginForm.patchValue({
            username: this.registerForm.value.email,
            password: ''
          });
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.detail || 'Error al registrar usuario';
          console.error('Register error:', error);
        }
      });
    }
  }

  switchMode() {
    this.isLoginMode = !this.isLoginMode;
    this.errorMessage = '';
    // Resetear los estados de visibilidad de contraseña al cambiar de modo
    this.showLoginPassword = false;
    this.showRegisterPassword = false;
  }

  toggleLoginPassword() {
    this.showLoginPassword = !this.showLoginPassword;
  }

  toggleRegisterPassword() {
    this.showRegisterPassword = !this.showRegisterPassword;
  }

  get loginUsername() { return this.loginForm.get('username'); }
  get loginPassword() { return this.loginForm.get('password'); }
  get registerNombre() { return this.registerForm.get('nombre'); }
  get registerEmail() { return this.registerForm.get('email'); }
  get registerPassword() { return this.registerForm.get('password'); }
}