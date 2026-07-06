import React, { useState } from 'react';

const CartSummary = props => {
  const { cartTotal, coupon, discount, applyCoupon, removeCoupon } = props;
  const [code, setCode] = useState('');

  const handleApply = () => {
    if (code.trim()) {
      applyCoupon(code.trim(), cartTotal);
      setCode('');
    }
  };

  const finalTotal = Math.max(0, cartTotal - discount);

  return (
    <div className='cart-summary'>
      <div className='summary-item d-flex justify-content-between align-items-center mb-2'>
        <span className='summary-label'>Shipping</span>
        <span className='summary-value'>Free</span>
      </div>

      {discount > 0 && (
        <div className='summary-item d-flex justify-content-between align-items-center mb-2 text-success'>
          <span className='summary-label d-flex align-items-center'>
            Discount ({coupon?.code || 'Promo'})
            <button
              className='btn-remove-coupon ml-2 text-danger p-0 border-0 bg-transparent'
              onClick={removeCoupon}
              title='Remove coupon'
              style={{ fontSize: '12px', cursor: 'pointer' }}
            >
              ✕
            </button>
          </span>
          <span className='summary-value'>-₹{discount}</span>
        </div>
      )}

      {/* Promo Code Input */}
      {!coupon ? (
        <div className='promo-code-input-container d-flex mb-3 mt-2'>
          <input
            type='text'
            className='form-control form-control-sm mr-2'
            placeholder='PROMO CODE'
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            style={{ fontSize: '12px', letterSpacing: '0.1em' }}
          />
          <button
            className='btn btn-outline-dark btn-sm px-3'
            onClick={handleApply}
            style={{ fontSize: '11px', fontWeight: '600' }}
          >
            APPLY
          </button>
        </div>
      ) : null}

      <div className='summary-item d-flex justify-content-between align-items-center mb-3 pt-2 border-top'>
        <span className='summary-label font-weight-bold'>Total</span>
        <span className='summary-value font-weight-bold'>₹{finalTotal.toFixed(2)}</span>
      </div>
    </div>
  );
};

export default CartSummary;
