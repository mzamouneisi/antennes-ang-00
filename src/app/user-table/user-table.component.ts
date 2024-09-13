import { Component } from '@angular/core';
import { saveAs } from 'file-saver'; // Utilisez file-saver pour télécharger les fichiers
import * as XLSX from 'xlsx';
import { AuthService } from '../auth.service';
import { MyUser } from '../my-user.model';
import { MyUserService } from '../my-user.service';

@Component({
  selector: 'app-user-table',
  templateUrl: './user-table.component.html',
  styleUrls: ['./user-table.component.css']
})
export class UserTableComponent {
  users: MyUser[] = [];
  importType: string = 'incremental';

  constructor(private userService: MyUserService, public authService: AuthService) { }

  currentUser: MyUser = { nom: '', my_email: '', password: '', age: 0, date_naiss: '', profile: 'User' };
  editingIndex: number | null = null;  // Index de l'utilisateur en cours d'édition

  ngOnInit() {
    this.users = this.userService.getUsers(); // Récupérer la liste des utilisateurs
  }

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
    this.currentUser = { nom: '', my_email: '', password: '', age: 0, date_naiss: '', profile: 'User' };
  }

  // Filtres
  nomFilter: string = '';
  my_emailFilter: string = '';
  passwordFilter: string = '';
  ageFilter: string = '';
  dateNaissFilter: string = '';
  profileFilter: string = '';

  // Méthode pour filtrer les utilisateurs
  get filteredUsers(): MyUser[] {
    return this.users.filter(user => {
      return (
        (!this.nomFilter || user.nom.toLowerCase().includes(this.nomFilter.toLowerCase())) &&
        (!this.my_emailFilter || user.my_email.toLowerCase().includes(this.my_emailFilter.toLowerCase())) &&
        (!this.passwordFilter || user.password.toLowerCase().includes(this.passwordFilter.toLowerCase())) &&
        (!this.ageFilter || user.age.toString().includes(this.ageFilter)) &&
        (!this.dateNaissFilter || user.date_naiss.includes(this.dateNaissFilter))
        &&
        (!this.profileFilter || user.profile.includes(this.profileFilter))
      );
    });
  }

  exportType: string = 'csv'; // Valeur par défaut

  export() {
    if (this.exportType === 'csv') {
      this.exportAsCSV();
    } else if (this.exportType === 'xlsx') {
      this.exportAsExcel();
    }
  }


  // Exporter les données filtrées en CSV
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

  // Exporter les données filtrées en Excel (XLSX)
  exportAsExcel() {
    import('xlsx').then(xlsx => {
      const worksheet = xlsx.utils.json_to_sheet(this.filteredUsers);
      const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
      saveAs(blob, 'users.xlsx');
    });
  }

  // Lorsque le fichier change (l'utilisateur sélectionne un fichier)
  onFileChange(event: any) {
    const file = event.target.files[0];

    if (file) {
      const fileExtension = file.name.split('.').pop().toLowerCase();

      if (fileExtension === 'csv') {
        this.readCSV(file);
      } else if (fileExtension === 'xlsx') {
        this.readExcel(file);
      } else {
        alert('Veuillez sélectionner un fichier CSV ou Excel');
      }
    }
  }

  // Importer un fichier CSV
  readCSV(file: File) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const csv = e.target.result;
      const lines = csv.split('\n');
      const result: MyUser[] = [];

      // Parcourir chaque ligne du CSV
      let i=-1
      for (const line of lines) {
        i++
        if(i==0) continue
        const [nom, my_email, password, age, date_naiss, profile] = line.split(',');

        if (nom && my_email && password && age && date_naiss && profile) {
          const newUser: MyUser = {
            nom: nom.trim(),
            my_email: my_email.trim(),
            password: password.trim(),
            age: Number(age.trim()),
            date_naiss: date_naiss.trim(),
            profile: profile.trim(),
          };

          // Appeler la méthode correcte selon le type d'import
          if (this.importType === 'incremental') {
            this.saveIncremental(newUser);
          } else {
            this.saveFull(newUser);
          }
        }
      }
    };
    reader.readAsText(file);
  }

  // Importer un fichier Excel (XLSX)
  readExcel(file: File) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });

      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      const excelData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      const result: MyUser[] = [];

      let i = 0
      for (const row of excelData) {
        i++
        if(i==0) continue
        const [nom, my_email, password, age, date_naiss, profile] = row;
        if (nom && my_email && password && age && date_naiss && profile) {
          const newUser: MyUser = {
            nom: nom.trim(),
            my_email: my_email.trim(),
            password: password.trim(),
            age: Number(age),
            date_naiss: date_naiss.trim(),
            profile: profile.trim(),
          };

          if (this.importType === 'incremental') {
            this.saveIncremental(newUser);
          } else {
            this.saveFull(newUser);
          }
        }
      }
    };
    reader.readAsArrayBuffer(file);
  }

  // Sauvegarde incrémentale : Mise à jour ou ajout de l'utilisateur
  saveIncremental(newUser: MyUser) {
    const existingUser = this.users.find(user => user.my_email === newUser.my_email);

    if (existingUser) {
      // Mettre à jour les autres colonnes si l'email existe
      existingUser.nom = newUser.nom;
      existingUser.password = newUser.password;
      existingUser.age = newUser.age;
      existingUser.date_naiss = newUser.date_naiss;
      existingUser.profile = newUser.profile;
    } else {
      // Ajouter un nouvel utilisateur si l'email n'existe pas
      this.users.push(newUser);
    }
  }

  // Sauvegarde complète : Ajouter tous les utilisateurs (remplacement complet)
  saveFull(newUser: MyUser) {
    this.users.push(newUser); // Ajoute l'utilisateur à la table (remplacement complet)
  }


}
