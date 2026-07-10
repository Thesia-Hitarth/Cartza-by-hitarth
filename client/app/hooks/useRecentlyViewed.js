import { useState, useCallback } from 'react';
import { getStorageItem, setStorageItem } from '../utils/storage';

export const useRecentlyViewed = () => {
  const [recentlyViewed, setRecentlyViewed] = useState(() => {
    try {
      return JSON.parse(getStorageItem('cartza_recently_viewed') || '[]');
    } catch (e) {
      console.error('Failed to load recently viewed products', e);
      return [];
    }
  });

  const addProductToRecentlyViewed = useCallback((product) => {
    if (!product || !product._id) return;
    setRecentlyViewed((prev) => {
      const filtered = prev.filter(p => p._id !== product._id);
      const updated = [product, ...filtered].slice(0, 4);
      try {
        setStorageItem('cartza_recently_viewed', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save recently viewed products', e);
      }
      return updated;
    });
  }, []);

  return [recentlyViewed, addProductToRecentlyViewed];
};
