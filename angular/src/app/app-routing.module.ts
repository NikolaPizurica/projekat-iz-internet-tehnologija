import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ChatWindowComponent } from './chat-window/chat-window.component';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './auth/auth.guard'

const routes: Routes = [
  { path: '', component: ChatWindowComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent},

  // redirect
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
