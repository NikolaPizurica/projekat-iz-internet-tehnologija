import { Component, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  //encapsulation: ViewEncapsulation.None // Remove Added css rules 
})
export class AppComponent {
  title = 'angular';
  loggedIn: boolean = false;
  admin: boolean = false;

  route: string = '/'

  constructor(private router: Router) {
    
    this.route = this.router.url;

  }
}
