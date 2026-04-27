import { useState } from 'react';
import { productRepository } from '../infrastructure/product.repository';

export const useProductActions = (onSuccess?: () => void) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createProduct = async (data: any) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await productRepository.create(data);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to create product');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateProduct = async (id: string, data: any) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await productRepository.update(id, data);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to update product');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteProduct = async (id: string) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await productRepository.delete(id);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to delete product');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { createProduct, updateProduct, deleteProduct, isSubmitting, error };
};
