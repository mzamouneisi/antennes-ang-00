import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { ShareService } from './share-service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  showInfosUserConnected = false 
  userConnected = this.authService.getUserConnected()

  constructor(public router: Router, public authService: AuthService, public shareService : ShareService) {}

  ngOnInit(): void {
    this.userConnected = this.authService.getUserConnected()
  }

  getButtonText(): string {
    const currentUser = this.userConnected;
    return currentUser ? currentUser.my_email : 'Se loguer';
  }

  getProfile(): string {
    const currentUser = this.userConnected;
    return currentUser ? currentUser.profile : '';
  }

  logout() {
    this.authService.logout();
    this.goToLogin();
    this.showInfosUserConnected = false 
    // this.shareService.showMenusTables=false 
  }

  goToLogin() {
    this.router.navigate(['/login']); // Redirige vers le composant de login
  }

  btn_users_clicked() {
    this.router.navigate(['/users'])
  }

  btn_users_filter_excel_clicked() {
    this.router.navigate(['/usersFilterExcel'])
  }
}
