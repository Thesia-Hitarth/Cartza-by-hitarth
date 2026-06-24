/**
 *
 * CartSummary
 *
 */

import React from 'react';

const CartSummary = props => {
  const { cartTotal } = props;

  return (
    <div className='cart-summary'>
      <div className='summary-item d-flex justify-content-between align-items-center mb-2'>
        <span className='summary-label'>Shipping</span>
        <span className='summary-value'>Free</span>
      </div>
      <div className='summary-item d-flex justify-content-between align-items-center mb-3'>
        <span className='summary-label'>Total</span>
        <span className='summary-value'>₹{cartTotal}</span>
      </div>
    </div>
  );
};

export default CartSummary;
