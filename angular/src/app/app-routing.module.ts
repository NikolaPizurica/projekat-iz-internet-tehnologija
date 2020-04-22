import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ChatWindowComponent } from './chat-window/chat-window.component';
import { LoginComponent } from './login/login.component';


const routes: Routes = [
  { path: '', component: ChatWindowComponent},
  { path: 'login', component: LoginComponent},

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
