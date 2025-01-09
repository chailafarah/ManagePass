import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PasswordService } from '../../services/password.service';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';

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

  constructor(public http: HttpClient, public auth: AngularFireAuth, private db: AngularFirestore, private router: Router, private passwordService: PasswordService,private toastr: ToastrService) { }

  ngOnInit(): void {
    this.auth.authState.subscribe(user => {
      if (user) {
        console.log('user is logged in');
        this.db.collection('passwords', ref => ref.where('uid', '==', user.uid))
          .valueChanges({ idField: 'id' }) // Méthode réactive pour écouter les modifications
          .subscribe((data: any[]) => {
            this.passwords = data
              .sort((a, b) => a.url.localeCompare(b.url));

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
    if (this.currentIndex === -1) { // Vérifier si l'élément est nouveau ou existant
      this.http.post(`http://localhost:3000/api/encrypt-aes-gcm`, { plainText: this.password, password: 'chaimaa' })
      .subscribe((response: any) => {
          this.auth.currentUser.then(user => { // Utilisation de `currentUser` pour obtenir l'utilisateur actuel
            if (user) {
              this.db.collection('passwords').add({
                uid: user.uid,
                username: this.username,
                url: this.url,
                email: this.email,
                password: response.encryptedData
              }).then((data) => {
                this.currentIndex = this.passwords.findIndex(password => password.id === data.id);
                this.toastr.success('Add successfully');
              }).catch((error) => {
                console.error('Error adding password', error);
                this.toastr.error('Error adding password');
              });
            }
          });
      });
    } else if (this.passwords[this.currentIndex].password !== this.password) {
      this.http.post(`http://localhost:3000/api/encrypt-aes-gcm`, { plainText: this.password, password: 'chaimaa' })
        .subscribe((response: any) => {
          this.auth.currentUser.then(user => {
            if (user) {
              this.db.collection('passwords').doc(this.passwords[this.currentIndex].id).update({
                username: this.username,
                url: this.url,
                email: this.email,
                password: response.encryptedData
              }).then(() => {
                this.toastr.success('Update successfully');
              }).catch((error) => {
                console.error('Error updating password', error);
                this.toastr.error('Error updating password');
              });
            }
          });
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
            this.toastr.success('Update successfully');
          }).catch((error) => {
            console.error('Error updating password', error);
            this.toastr.error('Error updating password');
          });
        }
      });
    }
  }  
  deletePassword() {
    this.auth.currentUser.then(user => {
      if (user) {
        this.db.collection('passwords').doc(this.passwords[this.currentIndex].id).delete().then(() => {
          this.toastr.success('Remove successfully');
        }).catch((error) => {
          console.error('Error deleting password', error);
         this.toastr.error('Error deleting password');
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
          this.toastr.success('Password copied successfully');
        }).catch((error) => {
          console.error('Error copying password to clipboard', error);
        });
    }); 
  }

  onBlur(): void {
    if (this.isPasswordVisible) {
      this.password = this.decryptedPassword;
      this.decryptedPassword = '';
      this.isPasswordVisible = false;  
    }
  }
}
