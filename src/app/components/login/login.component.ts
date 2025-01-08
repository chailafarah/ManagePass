import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router, RouterLink } from '@angular/router';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule,RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  constructor(public auth: AngularFireAuth , private router: Router) { }

  email: string = '';   // Propriété pour l'email
  password: string = ''; // Propriété pour le mot de passe

  // Méthode pour se connecter avec un email et un mot de passe
  login() {
    this.auth.signInWithEmailAndPassword(this.email, this.password).then(() => {
      console.log('Connecté avec succès');
      // Redirection vers la page listing
      this.router.navigate(['/listing']);
    }).catch((error) => {
      console.error('Erreur de connexion', error);
    });
  }
}
