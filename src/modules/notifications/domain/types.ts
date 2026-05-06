export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'ORDER_CREATED' | 'ORDER_ACCEPTED' | 'ORDER_CANCELLED' | 'ORDER_STATUS_CHANGED' | 'SYSTEM' | 'ALERT';
  isRead: boolean;
  createdAt: string;
  metadata?: {
    orderId?: string;
    [key: string]: any;
  };
}

export interface NotificationRepository {
  getNotifications(): Promise<Notification[]>;
  markAsRead(id: string): Promise<void>;
  markAllAsRead(): Promise<void>;
  delete(id: string): Promise<void>;
}

export const _NOTIFICATION_MODULE = true;
