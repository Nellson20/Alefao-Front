import { useState, useEffect, useCallback } from 'react';
import { productRepository } from '../infrastructure/product.repository';

export const useProducts = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await productRepository.getMyProducts();
      setProducts(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch products');
      console.error('Failed to fetch products:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, isLoading, error, refresh: fetchProducts };
};
