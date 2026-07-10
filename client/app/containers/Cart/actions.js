/*
 *
 * Cart actions
 *
 */

import { push } from '@lagunovsky/redux-react-router';
import { success } from 'react-notification-system-redux';
import axios from 'axios';

import {
  HANDLE_CART,
  ADD_TO_CART,
  REMOVE_FROM_CART,
  HANDLE_CART_TOTAL,
  SET_CART_ID,
  CLEAR_CART,
  APPLY_COUPON,
  REMOVE_COUPON
} from './constants';

import {
  SET_PRODUCT_SHOP_FORM_ERRORS,
  RESET_PRODUCT_SHOP
} from '../Admin/Product/constants';

import { API_URL, CART_ID, CART_ITEMS, CART_TOTAL } from '../../constants';
import { getStorageItem, setStorageItem, removeStorageItem } from '../../utils/storage';
import handleError from '../../utils/error';
import { allFieldsValidation } from '../../utils/validation';
import { toggleCart } from '../Navigation/actions';

// Handle Add To Cart
export const handleAddToCart = product => {
  return (dispatch, getState) => {
    const shopQuantity = Number(getState().product.productShopData.quantity || 1);
    const quantity = product.quantity ? Number(product.quantity) : shopQuantity;

    // Lock price at add time
    product.purchasePrice = product.price;
    const totalPrice = parseFloat((quantity * product.price).toFixed(2));

    const cartProduct = {
      ...product,
      quantity,
      totalPrice
    };

    const inventory = cartProduct.inventory || cartProduct.quantity; // Fallback to quantity if inventory not set

    const result = calculatePurchaseQuantity(inventory);

    const rules = {
      quantity: `min:1|max:${result}`
    };

    const { isValid, errors } = allFieldsValidation(cartProduct, rules, {
      'min.quantity': 'Quantity must be at least 1.',
      'max.quantity': `Quantity may not be greater than ${result}.`
    });

    if (!isValid) {
      return dispatch({ type: SET_PRODUCT_SHOP_FORM_ERRORS, payload: errors });
    }

    dispatch({
      type: RESET_PRODUCT_SHOP
    });

    const existingItems = getState().cart.cartItems || [];
    const existingIndex = existingItems.findIndex(
      item => item._id === product._id && item.color === product.color && item.size === product.size
    );

    let newCartItems = [];
    if (existingIndex >= 0) {
      const existingItem = existingItems[existingIndex];
      const newQty = existingItem.quantity + quantity;
      const cappedQty = Math.min(newQty, result);
      newCartItems = existingItems.map((item, idx) =>
        idx === existingIndex
          ? {
            ...item,
            quantity: cappedQty,
            totalPrice: parseFloat((cappedQty * (item.purchasePrice || item.price)).toFixed(2))
          }
          : item
      );
      dispatch({
        type: HANDLE_CART,
        payload: {
          cartItems: newCartItems,
          cartTotal: 0,
          cartId: getState().cart.cartId
        }
      });
    } else {
      newCartItems = [...existingItems, cartProduct];
      dispatch({
        type: ADD_TO_CART,
        payload: cartProduct
      });
    }

    setStorageItem(CART_ITEMS, JSON.stringify(newCartItems));
    dispatch(calculateCartTotal());
    dispatch(toggleCart());
  };
};

// Handle Remove From Cart
export const handleRemoveFromCart = product => {
  return (dispatch, getState) => {
    const cartItems = JSON.parse(getStorageItem(CART_ITEMS));
    const newCartItems = cartItems.filter(item => item._id !== product._id);
    setStorageItem(CART_ITEMS, JSON.stringify(newCartItems));

    dispatch({
      type: REMOVE_FROM_CART,
      payload: product
    });
    dispatch(calculateCartTotal());
    // dispatch(toggleCart());
  };
};

export const calculateCartTotal = () => {
  return (dispatch, getState) => {
    const cartItems = getState().cart.cartItems;

    let total = 0;

    cartItems.map(item => {
      total += (item.purchasePrice || item.price) * item.quantity;
    });

    total = parseFloat(total.toFixed(2));
    setStorageItem(CART_TOTAL, total);
    dispatch({
      type: HANDLE_CART_TOTAL,
      payload: total
    });
  };
};

// set cart store from local storage
export const handleCart = () => {
  const cart = {
    cartItems: JSON.parse(getStorageItem(CART_ITEMS)),
    cartTotal: getStorageItem(CART_TOTAL),
    cartId: getStorageItem(CART_ID)
  };

  return (dispatch, getState) => {
    if (cart.cartItems != undefined) {
      dispatch({
        type: HANDLE_CART,
        payload: cart
      });
      dispatch(calculateCartTotal());
      dispatch(revalidateCart());
    }
  };
};


export const handleCheckout = () => {
  return (dispatch, getState) => {
    const isAuthenticated = getState().authentication?.authenticated;

    dispatch(toggleCart());

    if (isAuthenticated) {
      // Authenticated users proceed directly to checkout
      dispatch(push('/checkout'));
    } else {
      // Unauthenticated users are redirected to login with a helpful message
      const loginOptions = {
        title: 'Login Required',
        message: 'Please login to proceed to checkout.',
        position: 'tr',
        autoDismiss: 3
      };
      dispatch(success(loginOptions));
      dispatch(push('/login'));
    }
  };
};

// Continue shopping use case
export const handleShopping = () => {
  return (dispatch, getState) => {
    dispatch(push('/shop'));
    dispatch(toggleCart());
  };
};

// create cart id api
export const getCartId = () => {
  return async (dispatch, getState) => {
    try {
      const cartId = getStorageItem(CART_ID);
      const cartItems = getState().cart.cartItems;
      const products = getCartItems(cartItems);

      // create cart id if there is no one
      if (!cartId) {
        const response = await axios.post(`${API_URL}/cart/add`, { products });

        dispatch(setCartId(response.data.cartId));
      }
    } catch (error) {
      handleError(error, dispatch);
    }
  };
};

export const setCartId = cartId => {
  return (dispatch, getState) => {
    setStorageItem(CART_ID, cartId);
    dispatch({
      type: SET_CART_ID,
      payload: cartId
    });
  };
};

export const clearCart = () => {
  return (dispatch, getState) => {
    removeStorageItem(CART_ITEMS);
    removeStorageItem(CART_TOTAL);
    removeStorageItem(CART_ID);

    dispatch({
      type: CLEAR_CART
    });
  };
};

const getCartItems = cartItems => {
  const newCartItems = [];
  cartItems.map(item => {
    const newItem = {};
    newItem.quantity = item.quantity;
    newItem.price = item.price;
    newItem.taxable = item.taxable;
    newItem.product = item._id;
    newItem.color = item.color;
    newItem.size = item.size;
    newCartItems.push(newItem);
  });

  return newCartItems;
};

const calculatePurchaseQuantity = inventory => {
  if (inventory <= 25) {
    return inventory;
  } else if (inventory > 25 && inventory <= 100) {
    return 5;
  } else if (inventory > 100 && inventory < 500) {
    return 25;
  } else {
    return 50;
  }
};

export const updateCartItemQuantity = (product, quantity) => {
  return async (dispatch, getState) => {
    if (quantity < 1) return;

    const inventory = product.inventory || product.quantity;
    if (quantity > inventory) {
      const warningOptions = {
        title: `Cannot exceed available inventory limit of ${inventory} items.`,
        position: 'tr',
        autoDismiss: 2
      };
      dispatch(success(warningOptions));
      return;
    }

    const cartId = getState().cart.cartId;
    if (cartId) {
      try {
        await axios.put(`${API_URL}/cart/update-quantity/${cartId}`, {
          productId: product._id,
          quantity
        });
      } catch (err) {
        handleError(err, dispatch);
        return;
      }
    }

    const cartItems = getState().cart.cartItems;
    const newCartItems = cartItems.map(item => {
      if (item._id === product._id) {
        return {
          ...item,
          quantity: quantity,
          totalPrice: parseFloat((quantity * (item.purchasePrice || item.price)).toFixed(2))
        };
      }
      return item;
    });

    setStorageItem(CART_ITEMS, JSON.stringify(newCartItems));
    dispatch({
      type: HANDLE_CART,
      payload: {
        cartItems: newCartItems,
        cartTotal: 0,
        cartId: getState().cart.cartId
      }
    });
    dispatch(calculateCartTotal());
  };
};

export const applyCoupon = (code, cartTotal) => {
  return async (dispatch, getState) => {
    try {
      const orderValue = cartTotal !== undefined ? cartTotal : getState().cart.cartTotal;
      const response = await axios.post(`${API_URL}/coupon/validate`, {
        code,
        orderValue
      });
      dispatch({
        type: APPLY_COUPON,
        payload: {
          coupon: response.data,
          discount: response.data.discount
        }
      });
      const successfulOptions = {
        title: 'Coupon applied successfully!',
        position: 'tr',
        autoDismiss: 3
      };
      dispatch(success(successfulOptions));
    } catch (error) {
      handleError(error, dispatch);
    }
  };
};

export const removeCoupon = () => {
  return {
    type: REMOVE_COUPON
  };
};

export const revalidateCart = () => {
  return async (dispatch, getState) => {
    const cartId = getState().cart.cartId || getStorageItem(CART_ID);
    if (!cartId) return false;

    try {
      const response = await axios.get(`${API_URL}/cart/validate/${cartId}`);
      if (response.data && response.data.cart) {
        const { hasChanges, priceChanges, removed, stockIssues, cart } = response.data;
        
        const revalidatedItems = cart.products.map(item => ({
          _id: item.product?._id,
          name: item.product?.name || 'Product',
          slug: item.product?.slug || '',
          imageUrl: item.product?.imageUrl || '/images/placeholder-image.png',
          brand: item.product?.brand || null,
          inventory: item.product?.inventory || item.product?.quantity || 1,
          quantity: item.quantity,
          price: item.price,
          purchasePrice: item.purchasePrice,
          color: item.color,
          size: item.size,
          totalPrice: item.totalPrice
        }));

        setStorageItem(CART_ITEMS, JSON.stringify(revalidatedItems));
        dispatch({
          type: HANDLE_CART,
          payload: {
            cartItems: revalidatedItems,
            cartTotal: 0,
            cartId
          }
        });
        dispatch(calculateCartTotal());

        if (hasChanges) {
          const warnings = [];
          if (priceChanges && priceChanges.length > 0) {
            priceChanges.forEach(p => {
              warnings.push(`Price of "${p.name}" changed from ₹${p.oldPrice} to ₹${p.newPrice}.`);
            });
          }
          if (removed && removed.length > 0) {
            removed.forEach(r => {
              warnings.push(`"${r.name}" was removed because: ${r.reason}.`);
            });
          }
          if (stockIssues && stockIssues.length > 0) {
            stockIssues.forEach(s => {
              warnings.push(`"${s.name}" quantity was adjusted to ${s.available} due to available stock.`);
            });
          }
          if (warnings.length > 0) {
            dispatch(success({
              title: 'Cart Updated',
              message: warnings.join(' '),
              position: 'tr',
              autoDismiss: 5
            }));
          }
        }
        return hasChanges;
      }
      return false;
    } catch (error) {
      console.warn('Cart revalidation failed:', error.message);
      return false;
    }
  };
};
