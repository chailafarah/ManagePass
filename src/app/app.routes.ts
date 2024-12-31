import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { ListingComponent } from './components/listing/listing.component';
import { RegisterComponent } from './components/register/register.component';

import { AngularFireAuthGuard, redirectUnauthorizedTo, redirectLoggedInTo } from '@angular/fire/compat/auth-guard';

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['login']);
const redirectLoggedInToItems = () => redirectLoggedInTo(['listing']);

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    title: 'Login Page',
    canActivate: [AngularFireAuthGuard],
    data: { authGuardPipe: redirectLoggedInToItems },
  },
  {
    path: 'listing',
    component: ListingComponent,
    title: 'Listing Page',
    canActivate: [AngularFireAuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin },
  },
  {
    path: 'register',
    component: RegisterComponent,
    title: 'Register Page'
  }, 
];
