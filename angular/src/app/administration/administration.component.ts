import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { environment } from '../../environments/environment';
import { Bot } from '../models/bot'

@Component({
  selector: 'app-administration',
  templateUrl: './administration.component.html',
  styleUrls: ['./administration.component.css']
})
export class AdministrationComponent implements OnInit {

  bots: Bot[];
  editing: boolean[][];

  constructor(private router: Router,
              private httpClient: HttpClient,
              private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.httpClient.get<any>(`${environment.apiUrl}/list_bots`)
      .subscribe((data) => {
        this.bots = data.bots;
        this.editing = new Array(this.bots.length);
        for (let i = 0; i < this.bots.length; i++) {
          this.editing[i] = new Array(3).fill(false);
          let bot = this.bots[i];
          bot.avatarSrc = `${environment.apiUrl}/get_avatar?id=${bot.id}&${Date.now()}`;
        }
      });
  }

  onAvatarError(e) {
    e.currentTarget.src = 'https://moonvillageassociation.org/wp-content/uploads/2018/06/default-profile-picture1.jpg';
  }

  changeAvatar(bot, e) {
    let fileList: FileList = e.target.files;
    if(fileList.length > 0) {
      let fileToUpload = fileList[0];
      const formData = new FormData();
      formData.append('file', fileToUpload, fileToUpload.name);
      this.httpClient.post(`${environment.apiUrl}/set_bot_avatar`, formData, {params: {bot_id: bot.id}})
        .subscribe((res) => {
          location.reload();
        });
    }
  }

  changeBotName(index) {
    let bot_id = this.bots[index].id;
    let bot_name = (<HTMLInputElement>document.querySelector('#botname' + index)).value;
    this.httpClient.put(`${environment.apiUrl}/change_bot_name`, {bot_id, bot_name})
      .subscribe((res) => {
        console.log(res);
        this.bots[index].bot_name = bot_name;
        this.editing[index][0] = false;
      });
  }

  changeBotDesc(index) {
    let bot_id = this.bots[index].id;
    let bot_desc = (<HTMLTextAreaElement>document.querySelector('#botdesc' + index)).value;
    this.httpClient.put(`${environment.apiUrl}/change_bot_desc`, {bot_id, bot_desc})
      .subscribe((res) => {
        console.log(res);
        this.bots[index].bot_desc = bot_desc;
        this.editing[index][1] = false;
      });
  }

}
