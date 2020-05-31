import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ChatWindowComponent } from './chat-window/chat-window.component';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './auth/auth.guard'
import { AdminGuard } from './auth/admin.guard'

import { ChatSearchComponent } from './chat-search/chat-search.component';
import { ChatDetailsComponent } from './chat-details/chat-details.component';
import { RegistrationComponent } from './registration/registration.component';
import { ProfileComponent } from './profile/profile.component';
import { AdministrationComponent } from './administration/administration.component'

const routes: Routes = [
  { path: '', component: ChatWindowComponent},
  { path: 'login', component: LoginComponent},
  { path: 'chat_search', component: ChatSearchComponent, canActivate: [AuthGuard] },
  { path: 'chat_details', component: ChatDetailsComponent, canActivate: [AuthGuard] },
  { path: 'registration', component: RegistrationComponent},
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard]},
  { path: 'administration', component: AdministrationComponent, canActivate: [AdminGuard]},

  // redirect
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
