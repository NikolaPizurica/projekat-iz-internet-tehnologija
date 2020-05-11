import { Component, OnInit } from '@angular/core';

import { Chat } from '../models/chat';
import { ChatService } from '../util/chat.service'

@Component({
  selector: 'app-chat-details',
  templateUrl: './chat-details.component.html',
  styleUrls: ['./chat-details.component.css']
})
export class ChatDetailsComponent implements OnInit {
  chat: Chat;

  constructor(private chatService: ChatService) { }

  ngOnInit(): void {
    this.chat = this.chatService.chat;
  }

}
