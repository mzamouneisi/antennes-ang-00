import { Component } from '@angular/core';
import { saveAs } from 'file-saver'; // Utilisez file-saver pour télécharger les fichiers
import * as XLSX from 'xlsx';

interface MyUser {
  nom: string;
  my_email: string;
  age: number;
  date_naiss: string;
  profile : string;
}

@Component({
  selector: 'app-user-table',
  templateUrl: './user-table.component.html',
  styleUrls: ['./user-table.component.css']
})
export class UserTableComponent {
  users: MyUser[] = [
    { nom: 'Dupont', my_email: 'Jean.dupont@gmail.com', age: 28, date_naiss: '1996-05-15', profile:'Admin' },
    { nom: 'Durand', my_email: 'Marie.durand@yahoo.com', age: 35, date_naiss: '1989-11-20', profile:'User'  },
    { nom: 'Martin', my_email: 'Paul.martin@next.com', age: 22, date_naiss: '2002-07-12', profile:'User'  },
    // Ajoutez plus de données ici
  ];

  currentUser: MyUser = { nom: '', my_email: '', age: 0, date_naiss: '', profile: 'User' };
  editingIndex: number | null = null;  // Index de l'utilisateur en cours d'édition

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
  this.currentUser = { nom: '', my_email: '', age: 0, date_naiss: '', profile: 'User' };
}

  // Filtres
  nomFilter: string = '';
  my_emailFilter: string = '';
  ageFilter: string = '';
  dateNaissFilter: string = '';
  profileFilter:string = '';

  // Méthode pour filtrer les utilisateurs
  get filteredUsers(): MyUser[] {
    return this.users.filter(user => {
      return (
        (!this.nomFilter || user.nom.toLowerCase().includes(this.nomFilter.toLowerCase())) &&
        (!this.my_emailFilter || user.my_email.toLowerCase().includes(this.my_emailFilter.toLowerCase())) &&
        (!this.ageFilter || user.age.toString().includes(this.ageFilter)) &&
        (!this.dateNaissFilter || user.date_naiss.includes(this.dateNaissFilter))
        &&
        (!this.profileFilter || user.profile.includes(this.profileFilter))
      );
    });
  }

  // Exporter les données filtrées en CSV
  exportAsCSV() {
    const csvData = this.convertToCSV(this.filteredUsers);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'users.csv');
  }

  convertToCSV(data: MyUser[]): string {
    const header = 'Nom,Email,Âge,Date de naissance,Profile\n';
    const rows = data.map(user => `${user.nom},${user.my_email},${user.age},${user.date_naiss},${user.profile}`).join('\n');
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

     // Lire un fichier CSV
  readCSV(file: File) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const csv = e.target.result;
      const lines = csv.split('\n');
      const result: MyUser[] = [];

      // Parcourir chaque ligne du CSV
      for (const line of lines) {
        const [nom, my_email, age, date_naiss, profile] = line.split(',');
        if (nom && my_email && age && date_naiss && profile) {
          result.push({
            nom: nom.trim(),
            my_email: my_email.trim(),
            age: Number(age.trim()),
            date_naiss: date_naiss.trim(),
            profile: profile.trim(),
          });
        }
      }

      this.users = result;
    };
    reader.readAsText(file);
  }

  // Lire un fichier Excel (XLSX)
readExcel(file: File) {
  const reader = new FileReader();
  reader.onload = (e: any) => {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: 'array' });

    // Suppose que la première feuille de calcul contient les données
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    // Convertir la feuille en JSON
    const excelData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    const result: MyUser[] = [];

    // Parcourir chaque ligne des données Excel
    for (const row of excelData) {
      // Ajout du typage explicite
      if (Array.isArray(row)) {
        const [nom, my_email, age, date_naiss, profile] = row; // Le typage explicite évite l'erreur TS2488
        if (nom && my_email && age && date_naiss && profile) {
          result.push({
            nom: nom.trim(),
            my_email: my_email.trim(),
            age: Number(age),
            date_naiss: date_naiss.trim(),
            profile: profile.trim(),
          });
        }
      }
    }

    this.users = result;
  };
  reader.readAsArrayBuffer(file);
}

}
