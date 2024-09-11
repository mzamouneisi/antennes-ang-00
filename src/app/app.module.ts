import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms'; // <-- Assurez-vous que ceci est importé
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { UserTableComponent } from './user-table/user-table.component';

@NgModule({
  declarations: [
    AppComponent,
    UserTableComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
