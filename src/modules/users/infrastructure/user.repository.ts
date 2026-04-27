import apiClient from '../../../core/api/client';

export interface UserRepository {
  getMe(): Promise<any>;
  updateProfile(data: any): Promise<any>;
  getVendors(params?: any): Promise<any>;
  getDrivers(params?: any): Promise<any>;
  deleteUser(id: string): Promise<void>;
}

export class ApiUserRepository implements UserRepository {
  async getMe(): Promise<any> {
    const response = await apiClient.get('/users/me');
    return response.data.data || response.data;
  }

  async updateProfile(data: any): Promise<any> {
    const response = await apiClient.patch('/users/me', data);
    return response.data;
  }

  async getVendors(params?: any): Promise<any> {
    const response = await apiClient.get('/users/vendors', { params });
    return response.data.data || response.data;
  }

  async getDrivers(params?: any): Promise<any> {
    const response = await apiClient.get('/users/drivers', { params });
    return response.data.data || response.data;
  }

  async deleteUser(id: string): Promise<void> {
    await apiClient.delete(`/users/${id}`);
  }
}

export const userRepository = new ApiUserRepository();
