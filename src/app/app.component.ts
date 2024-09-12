import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  showInfosUserConnected = false 
  constructor(public router: Router, public authService: AuthService) {}

  ngOnInit(): void {

  }

  getButtonText(): string {
    const currentUser = this.authService.getCurrentUser();
    return currentUser ? currentUser.my_email : 'Se loguer';
  }

  getProfile(): string {
    const currentUser = this.authService.getCurrentUser();
    return currentUser ? currentUser.profile : '';
  }

  logout() {
    this.authService.logout();
    this.goToLogin();
    this.showInfosUserConnected = false 
  }

  goToLogin() {
    this.router.navigate(['/login']); // Redirige vers le composant de login
  }
}
