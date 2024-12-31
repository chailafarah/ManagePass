import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  constructor(public auth: AngularFireAuth , private router: Router) { }
    firstname: string = '';   // Propriété pour le prénom
    lastname: string = '';    // Propriété pour le nom
    email: string = '';   // Propriété pour l'email
    password: string = ''; // Propriété pour le mot de passe
  
    // Méthode pour se connecter avec un email et un mot de passe
    // Méthode pour s'inscrire avec un email et un mot de passe
  signup() {
    this.auth.createUserWithEmailAndPassword(this.email, this.password).then(() => {
      console.log('Compte créé avec succès');
      
      // Affiche une alerte et redirige vers login
      // alert('Votre compte a été créé avec succès. Veuillez vous connecter.');
      this.router.navigate(['/login']);
    }).catch((error) => {
      console.error('Erreur lors de l\'inscription', error);
      // alert('Erreur lors de l\'inscription : ' + error.message);
    });
  }
}
