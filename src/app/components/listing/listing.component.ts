import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { endWith } from 'rxjs';

@Component({
  selector: 'app-listing',
  standalone: true,
  imports: [
    CommonModule,FormsModule
  ],
  templateUrl: './listing.component.html',
  styleUrl: './listing.component.scss'
})
export class ListingComponent implements OnInit {
  passwords: any[] = [];

  currentIndex: number = -1;
  username: string = '';   
  url: string = '';
  email: string = '';
  password: string = '';
  message: string = '';

  constructor(public auth: AngularFireAuth, private db: AngularFirestore, private router: Router) { }

  ngOnInit(): void {
    this.auth.authState.subscribe(user => {
      if (user) {
        console.log('user is logged in');
        this.db.collection('passwords', ref => ref.where('uid', '==', user.uid))
          .valueChanges({ idField: 'id' }) // Méthode réactive pour écouter les modifications
          .subscribe((data: any[]) => {
            this.passwords = data.sort((a, b) => a.url.localeCompare(b.url));

            if (this.currentIndex < 0) {
              this.selectPassword(0);
            }
          });
      } else {
        console.log('user is not logged in');
      }
    });
  }

  // Afficher ou masquer le formulaire
  toggleAddForm() {
    this.currentIndex = -1;

    // Réinitialiser les champs du formulaire
    this.username = '';
    this.url = '';
    this.email = '';
    this.password = '';
  }

  addPassword() {
    if (this.currentIndex === -1) {
      this.auth.currentUser.then(user => { // Utilisation de `currentUser` au lieu de `authState`
        if (user) {
          this.db.collection('passwords').add({
            uid: user.uid,
            username: this.username,
            url: this.url,
            email: this.email,
            password: this.password
          }).then((data) => {
            this.currentIndex = this.passwords.findIndex(password => password.id === data.id);
            console.log('Mot de passe ajouté avec succès');
          }).catch((error) => {
            console.error('Erreur lors de l\'ajout du mot de passe', error);
          });
        }
      });
    } else {
      this.auth.currentUser.then(user => {
        if (user) {
          this.db.collection('passwords').doc(this.passwords[this.currentIndex].id).update({
            username: this.username,
            url: this.url,
            email: this.email,
            password: this.password
          }).then(() => {
            this.message ='Mot de passe mis à jour avec succès';
          }).catch((error) => {
            console.error('Erreur lors de la mise à jour du mot de passe', error);
          });
        }
      });
    }  
  }  
  deletePassword() {
    this.auth.currentUser.then(user => {
      if (user) {
        this.db.collection('passwords').doc(this.passwords[this.currentIndex].id).delete().then(() => {
          console.log('Mot de passe supprimé avec succès');
        }).catch((error) => {
          console.error('Erreur lors de la suppression du mot de passe', error);
        });
      }
    });
  }

  // Méthode pour afficher les données sélectionnées
  selectPassword(index: any) {
    this.currentIndex = index;
    this.url = this.passwords[index].url;
    this.username = this.passwords[index].username;
    this.email = this.passwords[index].email;
    this.password = this.passwords[index].password;
    this.message = '';
  }

  logout() {
    this.auth.signOut().then(() => {
      this.router.navigate(['/login']);
      console.log('logout');
    });
  }
}
