export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'ORDER_CREATED' | 'ORDER_STATUS_CHANGED' | 'SYSTEM';
  isRead: boolean;
  createdAt: string;
  metadata?: {
    orderId?: string;
  };
}

export interface NotificationRepository {
  getNotifications(): Promise<Notification[]>;
  markAsRead(id: string): Promise<void>;
  markAllAsRead(): Promise<void>;
  delete(id: string): Promise<void>;
}

export const _NOTIFICATION_MODULE = true;
