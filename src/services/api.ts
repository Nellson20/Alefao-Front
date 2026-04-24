import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_BASE_URL_PREFIX = '/api';

const api = axios.create({
  baseURL: API_BASE_URL + API_BASE_URL_PREFIX,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 Unauthorized and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = Cookies.get('refreshToken');
        // Even if no refreshToken in Cookies, we try the request because it might be in HttpOnly cookies
        
        const response = await axios.post(`${API_BASE_URL}${API_BASE_URL_PREFIX}/auth/refresh`, {}, {
          withCredentials: true,
          headers: {
            Authorization: refreshToken ? `Bearer ${refreshToken}` : undefined
          }
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data;

        Cookies.set('token', accessToken, { expires: 7, sameSite: 'strict' });
        Cookies.set('refreshToken', newRefreshToken, { expires: 30, sameSite: 'strict' });

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        Cookies.remove('token');
        Cookies.remove('refreshToken');
        Cookies.remove('role');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const authService = {
  login: (credentials: any) => api.post('/auth/login', credentials),
  register: (userData: any) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
};

export const userService = {
  getMe: () => api.get('/users/me'),
  updateProfile: (data: any) => api.patch('/users/me', data),
  getVendors: (params?: any) => api.get('/users/vendors', { params }),
  getDrivers: (params?: any) => api.get('/users/drivers', { params }),
  deleteUser: (id: string) => api.delete(`/users/${id}`),
};

export const orderService = {
  getAllOrders: (params?: any) => api.get('/orders', { params }),
  getVendorOrders: (params?: any) => api.get('/orders/vendor/me', { params }),
  getDriverOrders: (params?: any) => api.get('/orders/driver/me', { params }),
  getOrderById: (id: string) => api.get(`/orders/${id}`),
  createOrder: (data: any) => api.post('/orders', data),
  acceptOrder: (id: string) => api.post(`/orders/${id}/accept`),
  pickupOrder: (id: string, code: string) => api.post(`/orders/${id}/pickup`, { code }),
  deliverOrder: (id: string, code: string) => api.post(`/orders/${id}/deliver`, { code }),
  updateOrder: (id: string, data: any) => api.patch(`/orders/${id}`, data),
  deleteOrder: (id: string) => api.delete(`/orders/${id}`),
};

export const driverService = {
  getAvailableJobs: (params?: any) => api.get('/orders/available', { params }),
};

export const productService = {
  getMyProducts: () => api.get('/products/vendor/me'),
  getProductById: (id: string) => api.get(`/products/${id}`),
  createProduct: (data: any) => api.post('/products', data),
  updateProduct: (id: string, data: any) => api.patch(`/products/${id}`, data),
  deleteProduct: (id: string) => api.delete(`/products/${id}`),
};

export default api;
