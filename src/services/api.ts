// This file is now deprecated and only kept for backward compatibility during migration.
// New code should use repositories in src/modules/[module]/infrastructure/

import apiClient from '../core/api/client';
import { authRepository } from '../modules/auth/infrastructure/auth.repository';
import { userRepository } from '../modules/users/infrastructure/user.repository';
import { orderRepository } from '../modules/orders/infrastructure/order.repository';
import { productRepository } from '../modules/products/infrastructure/product.repository';

/**
 * @deprecated Use authRepository from src/modules/auth/infrastructure/ instead
 */
export const authService = authRepository;

/**
 * @deprecated Use userRepository from src/modules/users/infrastructure/ instead
 */
export const userService = userRepository;

/**
 * @deprecated Use orderRepository from src/modules/orders/infrastructure/ instead
 */
export const orderService = orderRepository;

/**
 * @deprecated Use productRepository from src/modules/products/infrastructure/ instead
 */
export const productService = productRepository;

/**
 * @deprecated Use orderRepository from src/modules/orders/infrastructure/ instead
 */
export const driverService = {
  getAvailableJobs: (params?: any) => apiClient.get('/orders/available', { params }),
};

export default apiClient;
