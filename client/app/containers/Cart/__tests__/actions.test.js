import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { calculateCartTotal, revalidateCart, applyCoupon, handleAddToCart, handleRemoveFromCart } from '../actions';
import { HANDLE_CART_TOTAL, APPLY_COUPON, ADD_TO_CART, REMOVE_FROM_CART } from '../constants';

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

  describe('revalidateCart', () => {
    it('should return false if cartId is missing', async () => {
      const dispatch = vi.fn();
      const getState = () => ({
        cart: {
          cartId: null
        }
      });

      const result = await revalidateCart()(dispatch, getState);
      expect(result).toBe(false);
    });

    it('should revalidate cart items and dispatch actions if there are changes', async () => {
      const dispatch = vi.fn();
      const getState = () => ({
        cart: {
          cartId: 'cart-123',
          cartItems: []
        }
      });

      const mockResponse = {
        data: {
          cart: {
            products: [
              {
                product: {
                  _id: 'prod-1',
                  name: 'Product 1',
                  slug: 'product-1',
                  imageUrl: '/img.png',
                  inventory: 10,
                  price: 15
                },
                quantity: 2,
                price: 15,
                purchasePrice: 15,
                color: 'Default',
                size: 'Default',
                totalPrice: 30
              }
            ]
          },
          hasChanges: true,
          priceChanges: [{ name: 'Product 1', oldPrice: 10, newPrice: 15 }],
          removed: [],
          stockIssues: []
        }
      };

      vi.spyOn(axios, 'get').mockResolvedValue(mockResponse);

      const result = await revalidateCart()(dispatch, getState);

      expect(result).toBe(true);
      expect(dispatch).toHaveBeenCalled();
    });
  });

  describe('applyCoupon', () => {
    it('should successfully apply coupon and dispatch APPLY_COUPON', async () => {
      const dispatch = vi.fn();
      const getState = () => ({
        cart: {
          cartTotal: 100
        }
      });

      const mockResponse = {
        data: {
          code: 'SAVE10',
          discount: 10
        }
      };

      vi.spyOn(axios, 'post').mockResolvedValue(mockResponse);

      await applyCoupon('SAVE10', 100)(dispatch, getState);

      expect(dispatch).toHaveBeenCalledWith({
        type: APPLY_COUPON,
        payload: {
          coupon: mockResponse.data,
          discount: 10
        }
      });
    });
  });
});
