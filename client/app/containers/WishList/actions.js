/*
 *
 * WishList actions
 *
 */

import { success, warning } from 'react-notification-system-redux';
import axios from 'axios';

import { FETCH_WISHLIST, SET_WISHLIST_LOADING } from './constants';
import { TOGGLE_PRODUCT_WISHLIST } from '../Product/constants';
import handleError from '../../utils/error';
import { API_URL } from '../../constants';

export const updateWishlist = (isLiked, productId) => {
  return async (dispatch, getState) => {
    try {
      if (getState().authentication.authenticated === true) {
        dispatch({ type: TOGGLE_PRODUCT_WISHLIST, payload: productId });

        const response = await axios.post(`${API_URL}/wishlist`, {
          isLiked,
          product: productId
        });

        const successfulOptions = {
          title: `${response.data.message}`,
          position: 'tr',
          autoDismiss: 3
        };

        if (response.data.success === true) {
          dispatch(success(successfulOptions));
          dispatch(fetchWishlist());
        }
      } else {
        const retryOptions = {
          title: `Please login to wishlist a product`,
          position: 'tr',
          autoDismiss: 3
        };
        dispatch(warning(retryOptions));
      }
    } catch (error) {
      handleError(error, dispatch);
    }
  };
};

// fetch wishlist api
export const fetchWishlist = () => {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: SET_WISHLIST_LOADING, payload: true });

      const response = await axios.get(`${API_URL}/wishlist`);

      dispatch({ type: FETCH_WISHLIST, payload: response.data.wishlist });
    } catch (error) {
      handleError(error, dispatch);
    } finally {
      dispatch({ type: SET_WISHLIST_LOADING, payload: false });
    }
  };
};
