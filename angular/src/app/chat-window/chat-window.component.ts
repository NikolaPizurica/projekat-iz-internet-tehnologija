import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import * as $ from 'jquery';

import { AuthService } from '../auth/auth.service'
import { environment } from '../../environments/environment';
import { User } from '../models/user';
import { BotService } from '../util/bot.service';
import { Chat } from '../models/chat';
import { Bot } from '../models/bot';


@Component({
  selector: 'app-chat-window',
  templateUrl: './chat-window.component.html',
  styleUrls: [  './chat-window.component.css']//, '../../assets/css/materialize.min.css'],
  //encapsulation: ViewEncapsulation.None // Remove Added css rules 
  
})


export class ChatWindowComponent implements OnInit {
 
  user: User;
  userId: number;
  userAvi = '';
  bot: Bot;
  botAvi = '';
  currChat = {
    "title": "new chat",
    "chat_date": null,
    "user_id": -1,
    "messages": []
  };

  constructor(private httpClient: HttpClient,
              private authService: AuthService,
              private botService: BotService) { 
  }

  ngOnInit(): void {
    
  }

  openWindow() {
    (<HTMLDivElement>document.querySelector('#launch')).style.display = 'none';
    (<HTMLDivElement>document.querySelector('#container')).style.display = 'block';
    this.user = this.authService.currentUserValue;
    this.bot = this.botService.bot;
    if (this.user !== null) {
      this.userAvi = `${environment.apiUrl}/get_avatar?id=${this.user.id}&${Date.now()}`;
    }
    else {
      this.userAvi = `${environment.defaultAvi}`;
    }
    if (this.bot.avatarSrc !== null) {
      this.botAvi = `${environment.apiUrl}/get_avatar?id=${this.bot.id}&${Date.now()}`;
    }
    else {
      this.botAvi = `${environment.defaultAvi}`;
    }
    let today = new Date();
    let date = today.getFullYear() + '-' + (today.getMonth()+1) + '-' + today.getDate();
    if (this.user !== null) {
      this.userId = this.user.id;
    }
    else {
      this.userId = -1;
    }
    this.currChat = {
      "title": "new chat",
      "chat_date": date,
      "user_id": this.userId,
      "messages": []
    };
  }

  closeWindow() {
    (<HTMLDivElement>document.querySelector('#launch')).style.display = 'block';
    (<HTMLDivElement>document.querySelector('#container')).style.display = 'none';
  }

  onAvatarError(e) {
    e.currentTarget.src = `${environment.defaultAvi}`;
  }

  saveChat() {
    this.currChat.title = prompt('Enter chat title:', 'new chat');
    if (this.currChat.title === null) {
      return;
    }
    this.httpClient.post(`${environment.apiUrl}/save_chat`, this.currChat)
    .subscribe((res) => {
      console.log(res);
    });
  }

  getCurrTime() {
    const today = new Date();
    let h = today.getHours().toString();
    let m = today.getMinutes().toString();
    let s = today.getSeconds().toString();
    if (h.length === 1) {
      h = '0' + h;
    }
    if (m.length === 1) {
      m = '0' + m;
    }
    if (s.length === 1) {
      s = '0' + s;
    }
    return h + ":" + m + ":" + s;
  }

  filterLetters(text: string) {
    for (let i = 0; i < text.length; i++) {
      switch (text[i]) {
        case 'č':
          text = text.slice(0, i) + 'c' + text.slice(i+1);
          break;
        case 'ć':
          text = text.slice(0, i) + 'c' + text.slice(i+1);
          break;
        case 'đ':
          text = text.slice(0, i) + 'dj' + text.slice(i+1);
          break;
        case 'š':
          text = text.slice(0, i) + 's' + text.slice(i+1);
          break;
        case 'ž':
          text = text.slice(0, i) + 'z' + text.slice(i+1);
          break;
        case 'Č':
          text = text.slice(0, i) + 'C' + text.slice(i+1);
          break;
        case 'Ć':
          text = text.slice(0, i) + 'C' + text.slice(i+1);
          break;
        case 'Đ':
          text = text.slice(0, i) + 'Dj' + text.slice(i+1);
          break;
        case 'Š':
          text = text.slice(0, i) + 'S' + text.slice(i+1);
          break;
        case 'Ž':
          text = text.slice(0, i) + 'Z' + text.slice(i+1);
          break;
      }
    }
    return text;
  }

  onUserInput(e) {
    let input = <HTMLInputElement>document.querySelector('#keypad');
    const keyCode = e.keyCode || e.which;
    const text = this.filterLetters(input.value);
    if (keyCode === 13) {
      input.value = '';
      if (text === '' || text.trim() === '') {
        e.preventDefault();
        return;
      }
      else {
        e.preventDefault();
        console.log(text);
        let time = this.getCurrTime();
        this.currChat.messages.push({"content": text, "msg_time": time, "part_id": this.userId});
        let message = text;
        let sender = 'User' + this.userId;
        this.httpClient.post(this.bot.rest_endpoint, {message, sender})
        .subscribe((data) => {
          console.log(data);
          time = this.getCurrTime();
          for (let i = 0; i < (<Array<Object>>data).length; i++) {
            this.currChat.messages.push({"content": data[i].text, "msg_time": time, "part_id": this.bot.id});
          }
        },
        (err) => {
          time = this.getCurrTime();
          this.currChat.messages.push({"content": 'Poruka nije stigla do mog servera. Provjeri konekciju.', "msg_time": time, "part_id": this.bot.id});
        });
      }
    }
  }
  
}
