import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { environment } from '../../environments/environment';
import { Chat } from '../models/chat';
import { ChatService } from '../util/chat.service'

@Component({
  selector: 'app-chat-search',
  templateUrl: './chat-search.component.html',
  styleUrls: ['./chat-search.component.css']
})
export class ChatSearchComponent implements OnInit {
  searchForm: FormGroup;
  chats: Chat[] = [];

  constructor(private httpClient: HttpClient, 
              private formBuilder: FormBuilder,
              private router: Router,
              private chatService: ChatService) { }

  ngOnInit(): void {
    this.searchForm = this.formBuilder.group({
      title_str: [''],
      date_from: [''],
      date_to: ['']
    });
    this.httpClient.get<any>(`${environment.apiUrl}/search_chats`)
      .subscribe((data) => {
        this.chats = data.chats;
      });
  }

  get f() { return this.searchForm.controls; }

  onSubmit() {
    let getParams: any = {};
    if (this.f.title_str.value) {
      getParams.title_str = this.f.title_str.value;
    }
    if (this.f.date_from.value) {
      getParams.date_from = this.f.date_from.value;
    }
    if (this.f.date_to.value) {
      getParams.date_to = this.f.date_to.value;
    }
    // console.log(getParams);

    this.httpClient.get<any>(`${environment.apiUrl}/search_chats`, { params: getParams })
      .subscribe((data) => {
        this.chats = data.chats;
        console.log(this.chats);
        this.router.navigate(['/chat_search']);
      });
  }

  gotoChat(chat: Chat) {
    // console.log(chat);
    this.httpClient.get<Chat>(`${environment.apiUrl}/get_chat`, { params: { chat_num: `${chat.chat_num}` } })
      .subscribe((data) => {
        this.chatService.chat = data;
        this.router.navigate(['/chat_details']);
      });
  }

}
