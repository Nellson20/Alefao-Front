import apiClient from '../../../core/api/client';
import type { Order, OrderRepository } from '../domain/types';

export class ApiOrderRepository implements OrderRepository {
  async getAll(params?: any): Promise<Order[]> {
    const response = await apiClient.get('/orders', { params });
    return response.data.data || response.data;
  }

  async getVendorOrders(params?: any): Promise<Order[]> {
    const response = await apiClient.get('/orders/vendor/me', { params });
    return response.data.data || response.data;
  }

  async getDriverOrders(params?: any): Promise<Order[]> {
    const response = await apiClient.get('/orders/driver/me', { params });
    return response.data.data || response.data;
  }

  async getById(id: string): Promise<Order> {
    const response = await apiClient.get(`/orders/${id}`);
    return response.data;
  }

  async create(order: Partial<Order>): Promise<Order> {
    const formData = new FormData();
    
    Object.entries(order).forEach(([key, value]) => {
      if (key === 'attachments' && Array.isArray(value)) {
        const existingUrls: string[] = [];
        value.forEach(item => {
          if (item instanceof File) {
            formData.append('attachments', item);
          } else if (typeof item === 'string') {
            existingUrls.push(item);
          }
        });
        if (existingUrls.length > 0) {
          formData.append('attachments', JSON.stringify(existingUrls));
        }
      } else if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });

    const response = await apiClient.post('/orders', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }

  async update(id: string, order: Partial<Order>): Promise<Order> {
    const formData = new FormData();
    
    Object.entries(order).forEach(([key, value]) => {
      if (key === 'attachments' && Array.isArray(value)) {
        const existingUrls: string[] = [];
        value.forEach(item => {
          if (item instanceof File) {
            formData.append('attachments', item);
          } else if (typeof item === 'string') {
            existingUrls.push(item);
          }
        });
        if (existingUrls.length > 0) {
          formData.append('attachments', JSON.stringify(existingUrls));
        }
      } else if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });

    const response = await apiClient.patch(`/orders/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/orders/${id}`);
  }

  async accept(id: string): Promise<void> {
    await apiClient.post(`/orders/${id}/accept`);
  }

  async pickup(id: string, code: string): Promise<void> {
    await apiClient.post(`/orders/${id}/pickup`, { code });
  }

  async deliver(id: string, code: string): Promise<void> {
    await apiClient.post(`/orders/${id}/deliver`, { code });
  }

  async getAvailableJobs(params?: any): Promise<Order[]> {
    const response = await apiClient.get('/orders/available', { params });
    return response.data.data || response.data;
  }
}

// Export a singleton instance
export const orderRepository = new ApiOrderRepository();
