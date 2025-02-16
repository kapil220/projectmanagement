// types.ts

export interface User {
  id: string;
  name: string;
  isOnline: boolean;
  lastSeen: string;
  profileImage: string;
}
export interface Message {
  id: number;
  user: string;
  type: 'text' | 'image' | 'audio';
  message: string;
  timestamps: string;
  channel_id: string;
  date: string;
  sender: string;
  receiver: string;
  createdAt: string;
 // unreadCount: number;
}
export interface ChatGroup {
  id: string;
  user_id: string;
  groupName: string;
  status: boolean;
  teamId: string;
}
export interface Project {
  id: string;
  projectName: string;
  description: string;
  startDate: string;
  endDate: string;
//  createdAt: string;
//  updatedAt: string;
  teamId: string;
  user_id: string;
  status: boolean;
}
export interface LastReadTime {
  id: string;
  userId: string;
  channelId: string;
  teamId: string;
  lastReadTime: string;
}
/*export interface Message {
  id: number;
  user: string;
  type: 'text' | 'image' | 'audio';
  message: string;
  timestamp: string;
  date: string;
  isRead: boolean;
  replies?: Message[];
  reactions?: { [key: string]: number };
  isStarred?: boolean;
  repliedTo?: number;
  unreadCount: number;
  sender: string;
  receiver: string;
}  */
