import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PasswordService } from '../../services/password.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-listing',
  standalone: true,
  imports: [
    CommonModule, FormsModule
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
  decryptedPassword: string = '';
  password: string = '';
  message: string = '';
  isPasswordVisible: boolean = false; // Contrôle la visibilité du mot de passe

  @ViewChild('passwordInput') passwordInputRef!: ElementRef;

  constructor(public http: HttpClient, public auth: AngularFireAuth, private db: AngularFirestore, private router: Router, private passwordService: PasswordService) { }

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
            } else {
              this.selectPassword(this.currentIndex);
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
      this.http.post('http://localhost:3000/api/encrypt-aes-gcm', { plainText: this.password, password: 'chaimaa' })
        .subscribe((response: any) => {
          if (this.currentIndex === -1) { // Vérifier si l'élément est nouveau ou existant
            this.auth.currentUser.then(user => { // Utilisation de `currentUser` au lieu de `authState`
              if (user) {
                this.db.collection('passwords').add({
                  uid: user.uid,
                  username: this.username,
                  url: this.url,
                  email: this.email,
                  password: response.encryptedData
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
                  password: response.encryptedData
                }).then(() => {
                  this.message ='Password updated successfully';
                }).catch((error) => {
                  console.error('Error updating password', error);
                });
              }
            });
          }

          console.log('Response from server:', response);
        });
  }  
  deletePassword() {
    this.auth.currentUser.then(user => {
      if (user) {
        this.db.collection('passwords').doc(this.passwords[this.currentIndex].id).delete().then(() => {
          console.log('Password successfully removed');
        }).catch((error) => {
          console.error('Error deleting password', error);
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
  /**
   * generate a random password using the password service
   */
  generatePassword(): void {
    this.password = this.passwordService.generatePassword();
  }
  /**
   * copy the password to the clipboard
   */
  copyPassword(): void {
    this.decryptedPassword = this.password;

    this.http.post('http://localhost:3000/api/decrypt-aes-gcm', { plainText: this.password, password: 'chaimaa' })
      .subscribe((response: any) => {
        this.password = response.encryptedData;

        navigator.clipboard.writeText(this.password).then(() => {
          this.passwordInputRef.nativeElement.focus(); 
          this.passwordInputRef.nativeElement.select(); 
          //reset the visibility of the password
          this.isPasswordVisible = true;
        }).catch((error) => {
          console.error('Error copying password to clipboard', error);
        });
    }); 
  }

  onBlur(): void {
    this.password = this.decryptedPassword;
    this.decryptedPassword = '';
    this.isPasswordVisible = false;
  }
}
