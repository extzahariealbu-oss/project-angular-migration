/**
 * Login Component
 * Evidence: /angularjs2/themes/tm/views/login2.html:9-36, /angularjs2/public/assets/pages/scripts/login-5.js
 * 
 * Fields: username (text), password (password)
 * No HTML5 validation attributes (no required/minlength/maxlength)
 * jQuery Validate: required for username and password only
 * AJAX POST to /login/ expects { success: true } or [{ error: '...' }]
 */

import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  username = signal('');
  password = signal('');
  errorMessage = signal('');
  isLoading = signal(false);

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    this.errorMessage.set('');
    
    if (!this.username() || !this.password()) {
      this.errorMessage.set('Username and password are required');
      return;
    }

    this.isLoading.set(true);

    this.authService.login({
      username: this.username(),
      password: this.password()
    }).subscribe({
      next: () => {
        this.authService.loadSession().subscribe({
          next: () => {
            this.router.navigate(['/dashboard']);
          },
          error: (err) => {
            this.errorMessage.set('Failed to load session');
            this.isLoading.set(false);
          }
        });
      },
      error: (err) => {
        this.errorMessage.set(err.message);
        this.isLoading.set(false);
      }
    });
  }
}
