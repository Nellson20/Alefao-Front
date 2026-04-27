import { useState } from 'react';
import { orderRepository } from '../infrastructure/order.repository';
import type { Order } from '../domain/types';

export const useOrderActions = (onSuccess?: () => void) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sanitizePayload = (data: Partial<Order>) => {
    const sanitized = { ...data } as any;
    
    const numericFields = [
      'pickupLat', 'pickupLng', 
      'deliveryLat', 'deliveryLng', 
      'weight', 'price'
    ];

    numericFields.forEach(field => {
      if (sanitized[field] !== undefined && sanitized[field] !== null && sanitized[field] !== '') {
        sanitized[field] = parseFloat(sanitized[field]);
      } else if (sanitized[field] === '') {
        sanitized[field] = undefined;
      }
    });

    return sanitized;
  };

  const createOrder = async (orderData: Partial<Order>) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await orderRepository.create(sanitizePayload(orderData));
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to create order');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateOrder = async (id: string, orderData: Partial<Order>) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await orderRepository.update(id, sanitizePayload(orderData));
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to update order');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteOrder = async (id: string) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await orderRepository.delete(id);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to delete order');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { createOrder, updateOrder, deleteOrder, isSubmitting, error };
};
