import { Injectable } from '@angular/core';

import { Chat } from '../models/chat';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  public chat: Chat;

  constructor() { }
}
