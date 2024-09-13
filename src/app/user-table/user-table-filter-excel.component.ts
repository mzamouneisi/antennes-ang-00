import { Component } from '@angular/core';
import { saveAs } from 'file-saver';
import { AuthService } from '../auth.service';
import { MyUser } from '../my-user.model';
import { MyUserService } from '../my-user.service';

@Component({
  selector: 'user-table-filter-excel',
  templateUrl: './user-table-filter-excel.component.html',
  styleUrls: ['./user-table.component.css']
})
export class UserTableFilterExcelComponent {
  users: MyUser[] = [];

  // Filtres des valeurs uniques
  nomFilterValues: string[] = [];
  emailFilterValues: string[] = [];
  passwordFilterValues: string[] = [];
  ageFilterValues: number[] = [];
  dateNaissFilterValues: string[] = [];
  profileFilterValues: string[] = [];

  // Sélections des filtres
  selectedNomFilter: string = '';
  selectedEmailFilter: string = '';
  selectedPasswordFilter: string = '';
  selectedAgeFilter: number | '' = '';
  selectedDateNaissFilter: string = '';
  selectedProfileFilter: string = '';

  constructor(private userService: MyUserService, public authService: AuthService) { }

  currentUser: MyUser = { nom: '', my_email: '', password: '', age: 0, date_naiss: '', profile: 'User' };
  editingIndex: number | null = null;

  showActions(): boolean {
    const user: MyUser | null = this.authService.getCurrentUser(); // Préciser que `user` peut être null
    if (user && user.profile === "Admin") {
      return true;
    }
    return false;
  }

      // Fonction pour éditer un utilisateur
      editUser(index: number) {
        this.editingIndex = index;
        this.currentUser = { ...this.users[index] };  // Cloner les données de l'utilisateur sélectionné
      }
  
      deleteUser(index: number) {
        this.users.splice(index, 1); // Supprime l'utilisateur de la liste
      }
  
      isEmailUnique(email: string): boolean {
        return !this.users.some(user => user.my_email === email);
      }
  
   // Fonction pour sauvegarder un utilisateur (ajout ou modification)
   saveUser() {
  
    if (this.editingIndex === null && !this.isEmailUnique(this.currentUser.my_email)) {
      alert('Cet email est déjà utilisé !');
      return;
    }
    
    if (this.editingIndex !== null) {
      // Mettre à jour l'utilisateur existant
      this.users[this.editingIndex] = { ...this.currentUser };
      this.editingIndex = null;
    } else {
      // Ajouter un nouvel utilisateur
      this.users.push({ ...this.currentUser });
    }
  
    // Réinitialiser le formulaire
    this.currentUser = { nom: '', my_email: '', password:'', age: 0, date_naiss: '', profile: 'User' };
  }
  

  ngOnInit() {
    this.users = this.userService.getUsers();
    this.populateFilterValues();
  }

  // Remplir les valeurs de filtres uniques
  populateFilterValues() {
    this.nomFilterValues = Array.from(new Set(this.users.map(user => user.nom)));
    this.emailFilterValues = Array.from(new Set(this.users.map(user => user.my_email)));
    this.passwordFilterValues = Array.from(new Set(this.users.map(user => user.password)));
    this.ageFilterValues = Array.from(new Set(this.users.map(user => user.age)));
    this.dateNaissFilterValues = Array.from(new Set(this.users.map(user => user.date_naiss)));
    this.profileFilterValues = Array.from(new Set(this.users.map(user => user.profile)));
  }

  get filteredUsers(): MyUser[] {
    return this.users.filter(user => {
      return (
        (!this.selectedNomFilter || user.nom === this.selectedNomFilter) &&
        (!this.selectedEmailFilter || user.my_email === this.selectedEmailFilter) &&
        (!this.selectedPasswordFilter || user.password === this.selectedPasswordFilter) &&
        (!this.selectedAgeFilter || user.age === this.selectedAgeFilter) &&
        (!this.selectedDateNaissFilter || user.date_naiss === this.selectedDateNaissFilter) &&
        (!this.selectedProfileFilter || user.profile === this.selectedProfileFilter)
      );
    });
  }

  exportAsCSV() {
    const csvData = this.convertToCSV(this.filteredUsers);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'users.csv');
  }

  convertToCSV(data: MyUser[]): string {
    const header = 'Nom,Email,Password,Âge,Date de naissance,Profile\n';
    const rows = data.map(user => `${user.nom},${user.my_email},${user.password},${user.age},${user.date_naiss},${user.profile}`).join('\n');
    return header + rows;
  }

  exportAsExcel() {
    import('xlsx').then(xlsx => {
      const worksheet = xlsx.utils.json_to_sheet(this.filteredUsers);
      const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
      saveAs(blob, 'users.xlsx');
    });
  }

  onFileChange(event: any) {
    // Import file logic remains unchanged
  }

  readCSV(file: File) {
    // CSV parsing logic remains unchanged
  }

  readExcel(file: File) {
    // Excel parsing logic remains unchanged
  }
}
