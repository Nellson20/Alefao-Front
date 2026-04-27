import apiClient from '../../../core/api/client';
import type { Notification, NotificationRepository } from '../domain/types';

export class ApiNotificationRepository implements NotificationRepository {
  async getNotifications(): Promise<Notification[]> {
    const response = await apiClient.get('/notifications');
    return response.data.data || response.data || [];
  }

  async create(data: Partial<Notification>): Promise<void> {
    await apiClient.post('/notifications', data);
  }

  async markAsRead(id: string): Promise<void> {
    await apiClient.patch(`/notifications/${id}/read`);
  }

  async markAllAsRead(): Promise<void> {
    await apiClient.patch('/notifications/read-all');
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/notifications/${id}`);
  }
}

export const notificationRepository = new ApiNotificationRepository();
