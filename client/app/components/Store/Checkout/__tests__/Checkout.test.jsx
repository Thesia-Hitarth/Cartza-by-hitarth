import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Checkout from '../index';

describe('Checkout Component', () => {
  const defaultProps = {
    authenticated: true,
    handleShopping: vi.fn(),
    handleCheckout: vi.fn(),
    placeOrder: vi.fn(),
    addresses: [
      { _id: 'addr1', address: '123 Main St', city: 'CityA', state: 'StateA', zipCode: '12345', isDefault: true },
      { _id: 'addr2', address: '456 Elm St', city: 'CityB', state: 'StateB', zipCode: '67890', isDefault: false }
    ],
    isPlacingOrder: false
  };

  it('renders shipping address select box with addresses when authenticated', () => {
    render(<Checkout {...defaultProps} />);
    
    expect(screen.getByLabelText(/shipping address:/i)).toBeInTheDocument();
    expect(screen.getByText(/123 Main St, CityA, StateA 12345/i)).toBeInTheDocument();
    expect(screen.getByText(/456 Elm St, CityB, StateB 67890/i)).toBeInTheDocument();
  });

  it('renders no address warning when addresses list is empty', () => {
    render(<Checkout {...defaultProps} addresses={[]} />);
    
    expect(screen.getByText(/no shipping addresses found/i)).toBeInTheDocument();
  });

  it('calls placeOrder with selected address ID when Place Order button is clicked', () => {
    render(<Checkout {...defaultProps} />);
    
    const select = screen.getByLabelText(/shipping address:/i);
    fireEvent.change(select, { target: { value: 'addr2' } });

    const placeOrderBtn = screen.getByRole('button', { name: /place order/i });
    fireEvent.click(placeOrderBtn);

    expect(defaultProps.placeOrder).toHaveBeenCalledWith('addr2');
  });

  it('renders Proceed to Checkout button when unauthenticated', () => {
    render(<Checkout {...defaultProps} authenticated={false} />);
    
    expect(screen.queryByLabelText(/shipping address:/i)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /proceed to checkout/i })).toBeInTheDocument();
  });
});
