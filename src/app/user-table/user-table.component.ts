import { Component } from '@angular/core';
import { saveAs } from 'file-saver'; // Utilisez file-saver pour télécharger les fichiers
import * as XLSX from 'xlsx';

interface MyUser {
  nom: string;
  prenom: string;
  age: number;
  date_naiss: string;
}

@Component({
  selector: 'app-user-table',
  templateUrl: './user-table.component.html',
  styleUrls: ['./user-table.component.css']
})
export class UserTableComponent {
  users: MyUser[] = [
    { nom: 'Dupont', prenom: 'Jean', age: 28, date_naiss: '1996-05-15' },
    { nom: 'Durand', prenom: 'Marie', age: 35, date_naiss: '1989-11-20' },
    { nom: 'Martin', prenom: 'Paul', age: 22, date_naiss: '2002-07-12' },
    // Ajoutez plus de données ici
  ];

  // Filtres
  nomFilter: string = '';
  prenomFilter: string = '';
  ageFilter: string = '';
  dateNaissFilter: string = '';

  // Méthode pour filtrer les utilisateurs
  get filteredUsers(): MyUser[] {
    return this.users.filter(user => {
      return (
        (!this.nomFilter || user.nom.toLowerCase().includes(this.nomFilter.toLowerCase())) &&
        (!this.prenomFilter || user.prenom.toLowerCase().includes(this.prenomFilter.toLowerCase())) &&
        (!this.ageFilter || user.age.toString().includes(this.ageFilter)) &&
        (!this.dateNaissFilter || user.date_naiss.includes(this.dateNaissFilter))
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
    const header = 'Nom,Prénom,Âge,Date de naissance\n';
    const rows = data.map(user => `${user.nom},${user.prenom},${user.age},${user.date_naiss}`).join('\n');
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
        const [nom, prenom, age, date_naiss] = line.split(',');
        if (nom && prenom && age && date_naiss) {
          result.push({
            nom: nom.trim(),
            prenom: prenom.trim(),
            age: Number(age.trim()),
            date_naiss: date_naiss.trim()
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
        const [nom, prenom, age, date_naiss] = row; // Le typage explicite évite l'erreur TS2488
        if (nom && prenom && age && date_naiss) {
          result.push({
            nom: nom.trim(),
            prenom: prenom.trim(),
            age: Number(age),
            date_naiss: date_naiss.trim()
          });
        }
      }
    }

    this.users = result;
  };
  reader.readAsArrayBuffer(file);
}

}
