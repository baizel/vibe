// src/hooks/useCartPersistence.ts - Hook for cart persistence
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { loadCartFromStorage } from '../store/cartSlice';
import { storageService, STORAGE_KEYS } from '../services/storage';

export const useCartPersistence = () => {
  const dispatch = useDispatch();
  const { isLoaded } = useSelector((state: RootState) => state.cart);

  useEffect(() => {
    const loadCart = async () => {
      if (!isLoaded) {
        try {
          const savedCart = await storageService.getObject<{
            items: any[];
            total: number;
          }>(STORAGE_KEYS.CART_STATE);
          
          dispatch(loadCartFromStorage(savedCart));
        } catch (error) {
          console.error('Failed to load cart from storage:', error);
          // Still mark as loaded even if loading failed
          dispatch(loadCartFromStorage(null));
        }
      }
    };

    loadCart();
  }, [dispatch, isLoaded]);

  return { isLoaded };
};