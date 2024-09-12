import { Injectable } from '@angular/core';
import { MyUser } from './my-user.model';

@Injectable({
  providedIn: 'root'
})
export class MyUserService {
  private users: MyUser[] = [
    { nom: 'Dupont', my_email: 'Jean.dupont@gmail.com', password:'aa', age: 28, date_naiss: '1996-05-15', profile:'Admin' },
    { nom: 'Durand', my_email: 'Marie.durand@yahoo.com', password:'aa', age: 35, date_naiss: '1989-11-20', profile:'User'  },
    { nom: 'Martin', my_email: 'Paul.martin@next.com', password:'aa', age: 22, date_naiss: '2002-07-12', profile:'User'  },
  ];
  
  // Fonction pour obtenir tous les utilisateurs
  getUsers(): MyUser[] {
    return this.users;
  }

  // Fonction pour obtenir un utilisateur par email
  getUserByEmail(email: string): MyUser | undefined {
    return this.users.find(user => user.my_email === email);
  }
}
