import { Component, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from './auth/auth.service';
import { User } from './models/user';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  //encapsulation: ViewEncapsulation.None // Remove Added css rules 
})
export class AppComponent {
  title = 'angular';
  
  // za sad je suvisno jer zakljucujemo na osnovu currentUser objekta
  loggedIn: boolean = false;
  
  route: string = '/'

  currentUser: User;

  constructor(private router: Router, private authService: AuthService) {
    this.route = this.router.url;
    this.authService.currentUser.subscribe(x => this.currentUser = x);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
