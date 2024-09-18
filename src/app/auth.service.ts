import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { MyUser } from './my-user.model';
import { MyUserService } from './my-user.service';

const keyAuthToken = 'authToken'

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private userConnected: MyUser | null = null; // Stocke l'utilisateur connecté

  constructor(private userService: MyUserService, private cookieService: CookieService) { }

  // Fonction de login qui vérifie les informations de connexion
  login(email: string, password: string): boolean {
    const user: MyUser | undefined = this.userService.getUserByEmail(email);
    if (user && user.password === password) {
      // Connexion réussie
      this.userConnected = user;
      this.cookieService.set(keyAuthToken, user.my_email, 30); // Stocker le token pendant 30 jour
      return true;
    }
    return false; // Identifiants incorrects
  }

  logout() {
    this.userConnected = null;
    this.cookieService.delete(keyAuthToken); // Supprimer le cookie à la déconnexion
  }

  isLoggedIn(): boolean {
    return !!this.cookieService.get(keyAuthToken);
  }

  getUserConnected(): MyUser | null {
    if(!this.userConnected) {

      // console.log("getUserConnected")
      const email = this.cookieService.get(keyAuthToken);
      // console.log("getUserConnected : email ", email)
      const u = this.userService.getUserByEmail(email)
      //  console.log("getUserConnected : u ", u)
      this.userConnected = u ? u : null;
      console.log("getUserConnected : userConnected ", this.userConnected)
    }

    return this.userConnected;
  }

}
