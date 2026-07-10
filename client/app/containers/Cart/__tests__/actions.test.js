import { describe, it, expect, vi, beforeEach } from 'vitest';
import { calculateCartTotal } from '../actions';
import { HANDLE_CART_TOTAL } from '../constants';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = String(value); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();
global.localStorage = localStorageMock;

describe('Cart Actions', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('calculateCartTotal', () => {
    it('should calculate the total price of all items in the cart', () => {
      const dispatch = vi.fn();
      const getState = () => ({
        cart: {
          cartItems: [
            { _id: '1', price: 10, quantity: 2 },
            { _id: '2', purchasePrice: 20, price: 15, quantity: 1 }
          ]
        }
      });

      calculateCartTotal()(dispatch, getState);

      expect(dispatch).toHaveBeenCalledWith({
        type: HANDLE_CART_TOTAL,
        payload: 40 // (10 * 2) + (20 * 1) = 40
      });
      expect(localStorage.getItem('cart_total')).toBe('40');
    });

    it('should handle an empty cart and set total to 0', () => {
      const dispatch = vi.fn();
      const getState = () => ({
        cart: {
          cartItems: []
        }
      });

      calculateCartTotal()(dispatch, getState);

      expect(dispatch).toHaveBeenCalledWith({
        type: HANDLE_CART_TOTAL,
        payload: 0
      });
      expect(localStorage.getItem('cart_total')).toBe('0');
    });
  });
});
