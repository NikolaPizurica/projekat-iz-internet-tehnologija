import { Component, OnInit } from '@angular/core';
import { trigger, transition, state, style, animate, keyframes } from '@angular/animations'

import { Chat } from '../models/chat';
import { ChatService } from '../util/chat.service'

@Component({
  selector: 'app-chat-details',
  templateUrl: './chat-details.component.html',
  styleUrls: ['./chat-details.component.css'],
  animations: [
    trigger('chatChanged', [
      transition('* => *', [
        animate(500, keyframes([
            style ({ opacity: 0.0, offset: 0.0 }),
            style ({ opacity : 1.0, offset: 1.0 }),
        ])),
    ]),
    ])
  ]
})
export class ChatDetailsComponent implements OnInit {
  
  constructor(public chatService: ChatService) { }

  ngOnInit(): void {
    
  }

}
