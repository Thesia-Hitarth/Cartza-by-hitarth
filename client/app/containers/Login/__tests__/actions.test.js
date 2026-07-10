import { describe, it, expect, vi, beforeEach } from 'vitest';
import { login } from '../actions';
import { SET_LOGIN_FORM_ERRORS } from '../constants';

describe('Login Actions - Form Validation', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should dispatch SET_LOGIN_FORM_ERRORS when email is missing', async () => {
    const dispatch = vi.fn();
    const getState = () => ({
      login: {
        loginFormData: {
          email: '',
          password: 'password123'
        }
      }
    });

    await login()(dispatch, getState);

    expect(dispatch).toHaveBeenCalledWith({
      type: SET_LOGIN_FORM_ERRORS,
      payload: {
        email: ['Email is required.']
      }
    });
  });

  it('should dispatch SET_LOGIN_FORM_ERRORS when password is less than 6 characters', async () => {
    const dispatch = vi.fn();
    const getState = () => ({
      login: {
        loginFormData: {
          email: 'test@example.com',
          password: '123'
        }
      }
    });

    await login()(dispatch, getState);

    expect(dispatch).toHaveBeenCalledWith({
      type: SET_LOGIN_FORM_ERRORS,
      payload: {
        password: ['Password must be at least 6 characters.']
      }
    });
  });
});
