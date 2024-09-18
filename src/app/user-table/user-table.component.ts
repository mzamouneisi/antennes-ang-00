import { Component } from '@angular/core';
import { saveAs } from 'file-saver'; // Utilisez file-saver pour télécharger les fichiers
import * as XLSX from 'xlsx';
import { AuthService } from '../auth.service';
import { MyUser } from '../my-user.model';
import { MyUserService } from '../my-user.service';

const tableHeaders = ['nom', 'my_email', 'password', 'age', 'date_naiss', 'profile'];

@Component({
  selector: 'app-user-table',
  templateUrl: './user-table.component.html',
  styleUrls: ['./user-table.component.css']
})
export class UserTableComponent {
  users: MyUser[] = [];
  importType: string = 'incremental';

  constructor(private userService: MyUserService, public authService: AuthService) { }

  currentUser: MyUser = this.getMyUserInit();
  editingIndex: number | null = null;  // Index de l'utilisateur en cours d'édition
  isShowForm = false 

  // Filtres
  nomFilter: string = '';
  my_emailFilter: string = '';
  passwordFilter: string = '';
  ageFilter: string = '';
  dateNaissFilter: string = '';
  profileFilter: string = '';

  showPanelExport=false 
  showPanelImport=false

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

  isColIdUnique(email: string): boolean {
    return !this.users.some(user => user.my_email === email);
  }

  isColIdUniqueOfCurrentUser(): boolean {
    return this.isColIdUnique(this.currentUser.my_email);
  }

  private findById(newUser: MyUser): MyUser | undefined {
    return this.users.find(user => user.my_email === newUser.my_email);
  }

  getMyUserInit(): MyUser {
    return { nom: '', my_email: '', password: '', age: 0, date_naiss: '', profile: 'User' };
  }

  ///////////////////////////////////////////////////

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

  closeFormEdit() {
    this.isShowForm = false 
  }

  // Fonction pour éditer un utilisateur
  editUser(index: number) {
    this.isShowForm = true 
    this.editingIndex = index;
    this.currentUser = { ...this.users[index] };  // Cloner les données de l'utilisateur sélectionné
  }

  deleteUser(index: number) {
    this.users.splice(index, 1); // Supprime l'utilisateur de la liste
  }

  // Fonction pour sauvegarder un utilisateur (ajout ou modification)
  saveUser() {

    if (this.editingIndex === null && !this.isColIdUniqueOfCurrentUser()) {
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
    this.currentUser = this.getMyUserInit();
  }




  getCSVHeader() {
    return tableHeaders.join(',') + '\n';
  };

  getCSVLine(user: MyUser) {
    let line = '';

    // Parcourir les headers pour récupérer les propriétés correspondantes de l'utilisateur
    tableHeaders.forEach((header, index) => {
      // Si ce n'est pas le premier élément, ajouter une virgule pour séparer les valeurs
      if (index > 0) {
        line += ',';
      }

      // Ajouter la valeur correspondante de l'utilisateur
      line += user[header as keyof MyUser];  // Utilisation de 'as keyof' pour la sécurité de type
    });

    return line;
  };

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
    const header = this.getCSVHeader();
    const rows = data.map(user => this.getCSVLine(user)).join('\n');
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

      // Ne pas importer la première ligne : extraire les noms de colonnes
      const headerLine = lines[0];
      const headers = headerLine.split(',').map((header: string) => header.trim().toLowerCase());

      // Vérifier que les noms de colonnes du fichier correspondent à ceux attendus
      const expectedHeaders = tableHeaders;

      // Vérifier la correspondance des colonnes
      const validFile = expectedHeaders.every(header => headers.includes(header));
      if (!validFile) {
        alert('Le fichier CSV ne contient pas les colonnes attendues. Importation annulée.');
        return;
      }

      const indexes: { [key: string]: number } = {};

      headers.forEach((header: string) => {
        indexes[header] = headers.indexOf(header)
      });

      // Parcourir chaque ligne du CSV (sauter la première ligne d'en-tête)
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        const columns = line.split(',');

        // S'assurer que la ligne contient le bon nombre de colonnes
        if (columns.length < expectedHeaders.length) continue;

        const newUser: MyUser = {} as MyUser; // Initialize an empty MyUser object

        headers.forEach((header: keyof MyUser) => {
          if (header === 'age') {
            newUser[header] = Number(columns[indexes[header]]?.trim()) || 0;
          } else {
            newUser[header] = columns[indexes[header]]?.trim() || '';
          }
        });

        // Appeler la méthode correcte selon le type d'import
        if (this.importType === 'incremental') {
          this.saveIncremental(newUser);
        } else {
          this.saveFull(newUser);
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

      // Sélectionner la première feuille de calcul
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      // Convertir la feuille en JSON, avec la première ligne en en-têtes (header: 1)
      const excelData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      // Vérifier si les colonnes correspondent à celles attendues
      const expectedHeaders = tableHeaders;

      // La première ligne du fichier Excel contient les noms de colonnes
      const headers = excelData[0].map((header: string) => header.trim().toLowerCase());

      // Vérifier la correspondance des colonnes
      const validFile = expectedHeaders.every(header => headers.includes(header));
      if (!validFile) {
        alert('Le fichier Excel ne contient pas les colonnes attendues. Importation annulée.');
        return;
      }

      const indexes: { [key: string]: number } = {};

      headers.forEach((header: string) => {
        indexes[header] = headers.indexOf(header)
      });

      // Parcourir chaque ligne des données Excel (en commençant après les en-têtes)
      for (let i = 1; i < excelData.length; i++) {
        const row = excelData[i];

        // Assurer que la ligne contient suffisamment de colonnes
        if (row.length < expectedHeaders.length) continue;

        const newUser: MyUser = {} as MyUser; // Initialize an empty MyUser object

        headers.forEach((header: string) => {

          if (header in newUser) {
            const key = header as keyof MyUser
            const value = row[indexes[key]]?.trim();

            if (key === 'age') {
              newUser[key] = Number(value) || 0;
            } else if (typeof newUser[key] === 'string') {
              newUser[key] = value || '';
            }
          }

        });


        // Appeler la méthode correcte selon le type d'import
        if (this.importType === 'incremental') {
          this.saveIncremental(newUser);
        } else {
          this.saveFull(newUser);
        }
      }
    };
    reader.readAsArrayBuffer(file);
  }

  // Sauvegarde incrémentale : Mise à jour ou ajout de l'utilisateur
  saveIncremental(newUser: MyUser) {
    const existingUser = this.findById(newUser);

    if (existingUser) {

      tableHeaders.forEach((header: string) => {
        const key = header as keyof MyUser
        // Ici, nous devons faire une conversion explicite des types pour dire à TypeScript que
        // nous savons que les valeurs sont compatibles.
        (existingUser[key] as any) = newUser[key];
      });
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
