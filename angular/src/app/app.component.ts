import { Component, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { environment } from '../environments/environment';
import { AuthService } from './auth/auth.service';
import { NotificationService } from './util/notification.service';
import { User } from './models/user';
import { BotService } from './util/bot.service';

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

  notificationCheck = null;

  constructor(private router: Router,
              private authService: AuthService,
              private httpClient: HttpClient,
              private botService: BotService) {
    this.route = this.router.url;
    this.authService.currentUser.subscribe(x => this.currentUser = x);

    if (localStorage.getItem('lastRefresh') === null) {
      localStorage.setItem('lastRefresh', (new Date()).toString());
      localStorage.setItem('notifications', JSON.stringify(new Array()));
    }
    this.check();
    this.notificationCheck = setInterval(this.check.bind(this), 5000);
    this.httpClient.get<any>(`${environment.apiUrl}/list_bots`)
      .subscribe((data) => {
        this.botService.bot = data.bots[0];
        this.botService.bot.avatarSrc = `${environment.apiUrl}/get_avatar?id=${data.bots[0].id}&${Date.now()}`;
      });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  check() {
    let timestamp = '';
    let lastRefresh = new Date(localStorage.getItem('lastRefresh'));
    timestamp += lastRefresh.getFullYear() + '-';
    timestamp += (lastRefresh.getMonth() + 1) + '-';
    timestamp += lastRefresh.getDate() + ' ';
    timestamp += lastRefresh.getHours() + ':';
    timestamp += lastRefresh.getMinutes() + ':';
    timestamp += lastRefresh.getSeconds();
    this.httpClient.get<any>(`${environment.apiUrl}/notifications`, { params: { ts: timestamp } })
      .subscribe((data) => {
        let notifications = JSON.parse(localStorage.getItem('notifications'));
        notifications = notifications.concat(data);
        localStorage.setItem('notifications', JSON.stringify(notifications));
        //console.log(localStorage.getItem('notifications'));

        let n = <HTMLSpanElement>document.querySelector('#notification');
        if (notifications.length) {
          n.innerText = notifications.length.toString();
          n.style.display = 'inline';
        }
        else {
          n.style.display = 'none';
        }
        localStorage.setItem('lastRefresh', (new Date()).toString());
      })
  }

  toggleNotifications(e) {
    let checkbox = <HTMLInputElement>e.target;
    if (!checkbox.checked) {
      clearInterval(this.notificationCheck);
    }
    else {
      this.notificationCheck = setInterval(this.check.bind(this), 5000);
    }
  }

  gotoBots() {
    this.router.navigate(['/bots']);
  }

  openSettings() {
    let settings: HTMLDivElement = document.querySelector('#settings');
    if (settings.style.display == "none") {
      settings.style.display = "block";
    }
    else {
      settings.style.display = "none";
    }
  }

}
