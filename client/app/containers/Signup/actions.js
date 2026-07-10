/*
 *
 * Signup actions
 *
 */

import { success } from 'react-notification-system-redux';
import axios from 'axios';

import {
  SIGNUP_CHANGE,
  SIGNUP_RESET,
  SET_SIGNUP_LOADING,
  SET_SIGNUP_SUBMITTING,
  SUBSCRIBE_CHANGE,
  SET_SIGNUP_FORM_ERRORS
} from './constants';

import { setAuth } from '../Authentication/actions';
import setToken from '../../utils/token';
import handleError from '../../utils/error';
import { allFieldsValidation } from '../../utils/validation';
import { API_URL } from '../../constants';
import { setStorageItem } from '../../utils/storage';

export const signupChange = (name, value) => {
  let formData = {};
  formData[name] = value;

  return {
    type: SIGNUP_CHANGE,
    payload: formData
  };
};

export const subscribeChange = () => {
  return {
    type: SUBSCRIBE_CHANGE
  };
};

export const signUp = (captchaToken) => {
  return async (dispatch, getState) => {
    try {
      const rules = {
        email: 'required|email',
        password: 'required|min:8',
        firstName: 'required',
        lastName: 'required'
      };

      const newUser = getState().signup.signupFormData;
      const isSubscribed = getState().signup.isSubscribed;

      let { isValid, errors } = allFieldsValidation(newUser, rules, {
        'required.email': 'Email is required.',
        'required.password': 'Password is required.',
        'min.password': 'Password must be at least 8 characters.',
        'required.firstName': 'First Name is required.',
        'required.lastName': 'Last Name is required.'
      });

      if (isValid && newUser.password && (!/[a-zA-Z]/.test(newUser.password) || !/[0-9!@#$%^&*]/.test(newUser.password))) {
        isValid = false;
        errors = {
          password: ['Password must contain at least one letter and one number or special character.']
        };
      }

      if (!isValid) {
        return dispatch({ type: SET_SIGNUP_FORM_ERRORS, payload: errors });
      }

      dispatch({ type: SET_SIGNUP_SUBMITTING, payload: true });
      dispatch({ type: SET_SIGNUP_LOADING, payload: true });

      const user = {
        isSubscribed,
        captchaToken,
        ...newUser
      };

      const response = await axios.post(`${API_URL}/auth/register`, user);

      const successfulOptions = {
        title: `You have signed up successfully! You will be receiving an email as well. Thank you!`,
        position: 'tr',
        autoDismiss: 3
      };

      try {
        setStorageItem('logged_in', 'true');
      } catch (e) {
        console.error('localStorage write blocked', e);
      }

      dispatch(setAuth());
      dispatch(success(successfulOptions));
      dispatch({ type: SIGNUP_RESET });
    } catch (error) {
      const title = `Please try to signup again!`;
      handleError(error, dispatch, title);
    } finally {
      dispatch({ type: SET_SIGNUP_SUBMITTING, payload: false });
      dispatch({ type: SET_SIGNUP_LOADING, payload: false });
    }
  };
};
