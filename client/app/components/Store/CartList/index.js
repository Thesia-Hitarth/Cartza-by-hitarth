/**
 *
 * CartList
 *
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Minus, Trash2 } from 'lucide-react/dist/cjs/lucide-react.cjs';

const CartList = props => {
  const { cartItems, handleRemoveFromCart, updateCartItemQuantity, toggleCart } = props;

  const handleProductClick = () => {
    if (toggleCart) {
      toggleCart();
    }
  };

  return (
    <div className='cart-list-custom'>
      {cartItems.map((item, index) => {
        return (
          <div key={item._id || index} className='cart-item-row d-flex align-items-center justify-content-between mb-4'>
            {/* Left: Product Image */}
            <div className='cart-item-img-box mr-3'>
              <img
                className='cart-item-img'
                src={`${item.imageUrl ? item.imageUrl : '/images/placeholder-image.png'}`}
                alt={item.name}
              />
            </div>

            {/* Middle: Details */}
            <div className='cart-item-details flex-grow-1 mr-3'>
              {item.brand && (
                <div className='cart-item-brand'>{item.brand.name || item.brand}</div>
              )}
              <h4 className='cart-item-name-text mb-2'>
                <Link to={`/product/${item.slug}`} onClick={handleProductClick}>
                  {item.name}
                </Link>
              </h4>

              {/* Quantity Stepper Pill */}
              <div className='cart-item-stepper-pill d-flex align-items-center'>
                <button
                  className='stepper-btn minus'
                  onClick={() => {
                    if (updateCartItemQuantity && item.quantity > 1) {
                      updateCartItemQuantity(item, item.quantity - 1);
                    }
                  }}
                  disabled={item.quantity <= 1}
                  aria-label="Decrease quantity"
                >
                  <Minus size={12} strokeWidth={2.5} />
                </button>
                <span className='stepper-value px-3'>{item.quantity}</span>
                <button
                  className='stepper-btn plus'
                  onClick={() => {
                    if (updateCartItemQuantity) {
                      updateCartItemQuantity(item, item.quantity + 1);
                    }
                  }}
                  aria-label="Increase quantity"
                >
                  <Plus size={12} strokeWidth={2.5} />
                </button>
              </div>
            </div>

            {/* Right: Pricing & Remove */}
            <div className='cart-item-right-block text-right d-flex flex-column align-items-end justify-content-between h-100'>
              <button
                className='cart-item-remove-btn mb-2'
                onClick={() => handleRemoveFromCart(item)}
                aria-label={`Remove ${item.name} from cart`}
              >
                <Trash2 size={16} strokeWidth={1.5} />
              </button>
              <div className='cart-item-price-display'>
                ₹{parseFloat(item.totalPrice || (item.price * item.quantity)).toFixed(2)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CartList;
