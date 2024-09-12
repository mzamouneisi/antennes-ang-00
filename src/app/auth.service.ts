import { Injectable } from '@angular/core';
import { MyUser } from './my-user.model';
import { MyUserService } from './my-user.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private currentUser: MyUser | null = null; // Stocke l'utilisateur connecté

  constructor(private userService: MyUserService) { }

  // Fonction de login qui vérifie les informations de connexion
  login(email: string, password: string): boolean {
    const user: MyUser | undefined = this.userService.getUserByEmail(email);
    if (user && user.password === password) {
      // Connexion réussie
      this.currentUser = user;
      return true;
    }
    return false; // Identifiants incorrects
  }

  getCurrentUser(): MyUser | null {
    return this.currentUser;
  }

  logout() {
    this.currentUser = null;
  }
}
