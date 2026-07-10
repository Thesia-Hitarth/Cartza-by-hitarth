/*
 *
 * Order actions
 *
 */

import { push } from '@lagunovsky/redux-react-router';
import axios from 'axios';
import { success } from 'react-notification-system-redux';

import {
  FETCH_ORDERS,
  FETCH_SEARCHED_ORDERS,
  FETCH_ORDER,
  UPDATE_ORDER_STATUS,
  SET_ORDERS_LOADING,
  SET_ADVANCED_FILTERS,
  CLEAR_ORDERS,
  SET_PLACING_ORDER
} from './constants';

import { clearCart, getCartId, revalidateCart } from '../Cart/actions';
import { toggleCart } from '../Navigation/actions';
import handleError from '../../utils/error';
import { API_URL, CART_ID } from '../../constants';

export const updateOrderStatus = value => {
  return {
    type: UPDATE_ORDER_STATUS,
    payload: value
  };
};

export const setOrderLoading = value => {
  return {
    type: SET_ORDERS_LOADING,
    payload: value
  };
};

export const fetchOrders = (page = 1) => {
  return async (dispatch, getState) => {
    try {
      dispatch(setOrderLoading(true));

      const response = await axios.get(`${API_URL}/order`, {
        params: {
          page: page ?? 1,
          limit: 20
        }
      });

      const { orders, totalPages, currentPage, count } = response.data;

      dispatch({
        type: FETCH_ORDERS,
        payload: orders
      });

      dispatch({
        type: SET_ADVANCED_FILTERS,
        payload: { totalPages, currentPage, count }
      });
    } catch (error) {
      dispatch(clearOrders());
      handleError(error, dispatch);
    } finally {
      dispatch(setOrderLoading(false));
    }
  };
};

export const fetchAccountOrders = (page = 1) => {
  return async (dispatch, getState) => {
    try {
      dispatch(setOrderLoading(true));

      const response = await axios.get(`${API_URL}/order/me`, {
        params: {
          page: page ?? 1,
          limit: 20
        }
      });

      const { orders, totalPages, currentPage, count } = response.data;

      dispatch({
        type: FETCH_ORDERS,
        payload: orders
      });

      dispatch({
        type: SET_ADVANCED_FILTERS,
        payload: { totalPages, currentPage, count }
      });
    } catch (error) {
      dispatch(clearOrders());
      handleError(error, dispatch);
    } finally {
      dispatch(setOrderLoading(false));
    }
  };
};

export const searchOrders = filter => {
  return async (dispatch, getState) => {
    try {
      dispatch(setOrderLoading(true));

      const response = await axios.get(`${API_URL}/order/search`, {
        params: {
          search: filter.value
        }
      });

      dispatch({
        type: FETCH_SEARCHED_ORDERS,
        payload: response.data.orders
      });
    } catch (error) {
      handleError(error, dispatch);
    } finally {
      dispatch(setOrderLoading(false));
    }
  };
};

export const fetchOrder = (id, withLoading = true) => {
  return async (dispatch, getState) => {
    try {
      if (withLoading) {
        dispatch(setOrderLoading(true));
      }

      const response = await axios.get(`${API_URL}/order/${id}`);

      dispatch({
        type: FETCH_ORDER,
        payload: response.data.order
      });
    } catch (error) {
      handleError(error, dispatch);
    } finally {
      if (withLoading) {
        dispatch(setOrderLoading(false));
      }
    }
  };
};

export const cancelOrder = () => {
  return async (dispatch, getState) => {
    try {
      const order = getState().order.order;

      await axios.delete(`${API_URL}/order/cancel/${order._id}`);

      dispatch(push(`/dashboard/orders`));
    } catch (error) {
      handleError(error, dispatch);
    }
  };
};

export const updateOrderItemStatus = (itemId, status) => {
  return async (dispatch, getState) => {
    try {
      const order = getState().order.order;

      const response = await axios.put(
        `${API_URL}/order/status/item/${itemId}`,
        {
          orderId: order._id,
          cartId: order.cartId,
          status
        }
      );

      if (response.data.orderCancelled) {
        dispatch(push(`/dashboard/orders`));
      } else {
        dispatch(updateOrderStatus({ itemId, status }));
        dispatch(fetchOrder(order._id, false));
      }

      const successfulOptions = {
        title: `${response.data.message}`,
        position: 'tr',
        autoDismiss: 3
      };

      dispatch(success(successfulOptions));
    } catch (error) {
      handleError(error, dispatch);
    }
  };
};

export const addOrder = (addressId) => {
  return async (dispatch, getState) => {
    try {
      let cartId = null;
      try {
        cartId = localStorage.getItem(CART_ID);
      } catch (e) {
        console.error('localStorage access denied', e);
      }
      const total = getState().cart.cartTotal;
      const couponCode = getState().cart.coupon?.code || null;

      if (cartId) {
        const response = await axios.post(`${API_URL}/order/add`, {
          cartId,
          total,
          addressId,
          couponCode
        });

        dispatch(push(`/order/success/${response.data.order._id}`));
        dispatch(clearCart());
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        try {
          localStorage.removeItem(CART_ID);
        } catch (e) {
          console.error('localStorage access denied', e);
        }
      }
      handleError(error, dispatch);
    }
  };
};

export const placeOrder = (addressId) => {
  return async (dispatch, getState) => {
    let loggedIn = false;
    try {
      loggedIn = localStorage.getItem('logged_in') === 'true';
    } catch (e) {
      console.error('localStorage access denied', e);
    }
    const cartItems = getState().cart.cartItems;
    if (!loggedIn || cartItems.length === 0) { dispatch(toggleCart()); return; }

    dispatch({ type: SET_PLACING_ORDER, payload: true });
    try {
      const hasChanges = await dispatch(revalidateCart());
      if (hasChanges) {
        dispatch({ type: SET_PLACING_ORDER, payload: false });
        return;
      }
      await dispatch(getCartId());
      await dispatch(addOrder(addressId));
    } catch (err) {
      handleError(err, dispatch);
    } finally {
      dispatch({ type: SET_PLACING_ORDER, payload: false });
      dispatch(toggleCart());
    }
  };
};

export const placeGuestOrder = (guestDetails) => {
  return async (dispatch, getState) => {
    const cartItems = getState().cart.cartItems;
    if (cartItems.length === 0) { dispatch(toggleCart()); return; }

    dispatch({ type: SET_PLACING_ORDER, payload: true });
    try {
      const hasChanges = await dispatch(revalidateCart());
      if (hasChanges) {
        dispatch({ type: SET_PLACING_ORDER, payload: false });
        return;
      }
      await dispatch(getCartId());
      let cartId = null;
      try {
        cartId = localStorage.getItem(CART_ID);
      } catch (e) {
        console.error('localStorage access denied', e);
      }
      const couponCode = getState().cart.coupon?.code || null;

      if (cartId) {
        const response = await axios.post(`${API_URL}/order/initiate-guest`, {
          cartId,
          guestDetails,
          couponCode
        });

        const { addressId, userId } = response.data;

        const addResponse = await axios.post(`${API_URL}/order/add-guest`, {
          cartId,
          addressId,
          userId
        });

        dispatch(push(`/order/success/${addResponse.data.order._id}`));
        dispatch(clearCart());
      }
    } catch (err) {
      handleError(err, dispatch);
    } finally {
      dispatch({ type: SET_PLACING_ORDER, payload: false });
      dispatch(toggleCart());
    }
  };
};

export const clearOrders = () => {
  return {
    type: CLEAR_ORDERS
  };
};
