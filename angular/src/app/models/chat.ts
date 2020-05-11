import { Message } from './message'
export class Chat {
    chat_num: number;
    title: string;
    chat_date: string;
    user_id: number;
    messages?: Message[];
}