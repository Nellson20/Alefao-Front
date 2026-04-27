import apiClient from '../../../core/api/client';

export interface AuthRepository {
  login(credentials: any): Promise<any>;
  register(userData: any): Promise<any>;
  logout(): Promise<void>;
}

export class ApiAuthRepository implements AuthRepository {
  async login(credentials: any): Promise<any> {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  }

  async register(userData: any): Promise<any> {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  }

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  }
}

export const authRepository = new ApiAuthRepository();
