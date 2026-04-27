import { useState, useEffect, useCallback } from 'react';
import { orderRepository } from '../infrastructure/order.repository';
import type { Order } from '../domain/types';

export const useOrders = (userRole: string | undefined) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    if (!userRole) return;
    
    setIsLoading(true);
    setError(null);
    try {
      let data: Order[] = [];
      if (userRole === 'admin') {
        data = await orderRepository.getAll();
      } else if (userRole === 'vendor') {
        data = await orderRepository.getVendorOrders();
      } else if (userRole === 'driver') {
        data = await orderRepository.getDriverOrders();
      }
      setOrders(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch orders');
      console.error('Failed to fetch orders:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userRole]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return { orders, isLoading, error, refresh: fetchOrders };
};
