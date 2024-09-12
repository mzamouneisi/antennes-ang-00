import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { UserTableComponent } from './user-table/user-table.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent }, // Définir la route vers le composant de connexion
  { path: '', redirectTo: '/login', pathMatch: 'full' }, // Redirection par défaut vers login
    { path: 'users', component: UserTableComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
