// types.ts

export interface User {
  id: string;
  name: string;
  isOnline: boolean;
  lastSeen: Date;
  profileImage: string;
}

export interface Message {
  id: string;
  sender: User;
  content: string;
  type: 'text' | 'image' | 'audio';
  timestamp: Date;
  date: Date;
  isRead: boolean;
}
