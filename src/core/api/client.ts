import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_BASE_URL_PREFIX = '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL + API_BASE_URL_PREFIX,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = Cookies.get('refreshToken');
        
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
        return apiClient(originalRequest);
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

export default apiClient;
