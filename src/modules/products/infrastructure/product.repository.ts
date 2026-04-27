import apiClient from '../../../core/api/client';

export interface ProductRepository {
  getMyProducts(): Promise<any>;
  getById(id: string): Promise<any>;
  create(data: any): Promise<any>;
  update(id: string, data: any): Promise<any>;
  delete(id: string): Promise<void>;
}

export class ApiProductRepository implements ProductRepository {
  async getMyProducts(): Promise<any> {
    const response = await apiClient.get('/products/vendor/me');
    return response.data.data || response.data;
  }

  async getById(id: string): Promise<any> {
    const response = await apiClient.get(`/products/${id}`);
    return response.data.data || response.data;
  }

  async create(data: any): Promise<any> {
    const response = await apiClient.post('/products', data);
    return response.data.data || response.data;
  }

  async update(id: string, data: any): Promise<any> {
    const response = await apiClient.patch(`/products/${id}`, data);
    return response.data.data || response.data;
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/products/${id}`);
  }
}

export const productRepository = new ApiProductRepository();
