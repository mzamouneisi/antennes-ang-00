import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { MyUser } from './my-user.model';
import { MyUserService } from './my-user.service';

const keyAuthToken = 'authToken'

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private currentUser: MyUser | null = null; // Stocke l'utilisateur connecté

  constructor(private userService: MyUserService, private cookieService: CookieService) { }

  // Fonction de login qui vérifie les informations de connexion
  login(email: string, password: string): boolean {
    const user: MyUser | undefined = this.userService.getUserByEmail(email);
    if (user && user.password === password) {
      // Connexion réussie
      this.currentUser = user;
      this.cookieService.set(keyAuthToken, user.my_email, 30); // Stocker le token pendant 30 jour
      return true;
    }
    return false; // Identifiants incorrects
  }

  logout() {
    this.currentUser = null;
    this.cookieService.delete(keyAuthToken); // Supprimer le cookie à la déconnexion
  }

  isLoggedIn(): boolean {
    return !!this.cookieService.get(keyAuthToken);
  }

  getCurrentUser(): MyUser | null {
    const email = this.cookieService.get(keyAuthToken);
    const u = this.userService.getUserByEmail(email)
    this.currentUser = u ? u : null;

    return this.currentUser;
  }

}
