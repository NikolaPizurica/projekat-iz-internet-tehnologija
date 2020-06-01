import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { environment } from '../../environments/environment';
import { Bot } from '../models/bot';
import { NotificationService } from '../util/notification.service';
import { BotService } from '../util/bot.service';

@Component({
  selector: 'app-bots',
  templateUrl: './bots.component.html',
  styleUrls: ['./bots.component.css']
})
export class BotsComponent implements OnInit {

  currBot: Bot;
  bots: Bot[];
  notifications: number[];

  constructor(private router: Router,
              private httpClient: HttpClient,
              private formBuilder: FormBuilder,
              private botService: BotService) { }

  ngOnInit(): void {
    this.currBot = this.botService.bot;
    this.httpClient.get<any>(`${environment.apiUrl}/list_bots`)
      .subscribe((data) => {
        this.bots = data.bots;
        this.notifications = JSON.parse(localStorage.getItem('notifications'));
        for (let i = 0; i < this.bots.length; i++) {
          let bot = this.bots[i];
          bot.avatarSrc = `${environment.apiUrl}/get_avatar?id=${bot.id}&${Date.now()}`;
        }
        localStorage.setItem('notifications', JSON.stringify(new Array()));
      });
  }

  onAvatarError(e) {
    e.currentTarget.src = `${environment.defaultAvi}`;
  }

  botChanged(index) {
    this.botService.bot = this.bots[index];
  }

}
