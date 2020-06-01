import { Injectable } from '@angular/core';
import { Bot } from '../models/bot';

@Injectable({
  providedIn: 'root'
})
export class BotService {

  bot: Bot;

  constructor() { }
}
