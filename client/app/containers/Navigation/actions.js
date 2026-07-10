/*
 *
 * Navigation actions
 *
 */

import axios from 'axios';
import handleError from '../../utils/error';
import {
  TOGGLE_MENU,
  TOGGLE_CART,
  TOGGLE_BRAND,
  SEARCH_CHANGE,
  SUGGESTIONS_FETCH_REQUEST,
  SUGGESTIONS_CLEAR_REQUEST
} from './constants';
import { API_URL } from '../../constants';

export const toggleMenu = () => {
  return {
    type: TOGGLE_MENU
  };
};

export const toggleCart = () => {
  return {
    type: TOGGLE_CART
  };
};

export const toggleBrand = () => {
  return {
    type: TOGGLE_BRAND
  };
};

export const onSearch = v => {
  return {
    type: SEARCH_CHANGE,
    payload: v
  };
};

import debounce from 'lodash/debounce';

let searchAbortController = null;

const debouncedFetch = debounce(async (inputValue, dispatch) => {
  try {
    if (searchAbortController) {
      searchAbortController.abort();
    }
    searchAbortController = new AbortController();

    const response = await axios.get(
      `${API_URL}/product/list/search/${inputValue}`,
      { signal: searchAbortController.signal }
    );
    dispatch({
      type: SUGGESTIONS_FETCH_REQUEST,
      payload: response.data.products
    });
  } catch (error) {
    if (axios.isCancel(error)) {
      return;
    }
    handleError(error, dispatch);
  }
}, 300);

export const onSuggestionsFetchRequested = value => {
  const inputValue = value.value.trim().toLowerCase();

  return (dispatch) => {
    if (inputValue) {
      debouncedFetch(inputValue, dispatch);
    }
  };
};

export const onSuggestionsClearRequested = () => {
  return {
    type: SUGGESTIONS_CLEAR_REQUEST,
    payload: []
  };
};
