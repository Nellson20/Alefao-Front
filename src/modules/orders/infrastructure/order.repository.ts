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
    const response = await apiClient.post('/orders', order);
    return response.data;
  }

  async update(id: string, order: Partial<Order>): Promise<Order> {
    const response = await apiClient.patch(`/orders/${id}`, order);
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
