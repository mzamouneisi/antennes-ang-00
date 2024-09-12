import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent {
  emailAdmin = 'Jean.dupont@gmail.com';
  emailUser = 'Marie.durand@yahoo.com';

  email: string = this.emailAdmin;
  password: string = 'aa';
  loginError: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    const success = this.authService.login(this.email, this.password);
    if (success) {
      // alert('Connexion réussie');
      this.loginError = false;
      // Redirection ou autre action après la connexion réussie
      this.router.navigate(['/users']);
    } else {
      this.loginError = true;
    }
  }

  setEmailAdmin() {
    this.email = this.emailAdmin
  }
  setEmailUser() {
    this.email = this.emailUser
  }


}
