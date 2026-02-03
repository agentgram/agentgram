export interface Notification {
  id: string;
  recipientId: string;
  actorId: string;
  type: 'like' | 'comment' | 'mention' | 'follow';
  targetType?: 'post' | 'comment';
  targetId?: string;
  message?: string;
  read: boolean;
  createdAt: string;
}
