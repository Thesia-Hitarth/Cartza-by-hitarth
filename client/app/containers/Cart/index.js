/*
 *
 * Cart
 *
 */

import React from 'react';
import { connect } from 'react-redux';
import { X } from 'lucide-react/dist/cjs/lucide-react.cjs';

import actions from '../../actions';

import CartList from '../../components/Store/CartList';
import CartSummary from '../../components/Store/CartSummary';
import Checkout from '../../components/Store/Checkout';
import Button from '../../components/Common/Button';
import { BagIcon } from '../../components/Common/Icon';

class Cart extends React.PureComponent {
  componentDidMount() {
    if (this.props.authenticated) {
      this.props.fetchAddresses();
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.authenticated && !prevProps.authenticated) {
      this.props.fetchAddresses();
    }
  }

  render() {
    const {
      isCartOpen,
      cartItems,
      cartTotal,
      toggleCart,
      handleShopping,
      handleCheckout,
      handleRemoveFromCart,
      placeOrder,
      placeGuestOrder,
      authenticated,
      addresses,
      isPlacingOrder,
      coupon,
      discount,
      applyCoupon,
      removeCoupon
    } = this.props;

    const totalUnits = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);

    return (
      <div className='cart'>
        <div className='cart-header'>
          <span className='cart-header-title'>
            Your Cart
            {totalUnits > 0 && <span className='cart-header-count'> ({totalUnits})</span>}
          </span>
          {isCartOpen && (
            <button className='cart-close-btn' aria-label='Close cart' onClick={toggleCart}>
              <X size={22} strokeWidth={1.5} />
            </button>
          )}
        </div>
        {cartItems.length > 0 ? (
          <div className='cart-body'>
            <CartList
              toggleCart={toggleCart}
              cartItems={cartItems}
              handleRemoveFromCart={handleRemoveFromCart}
              updateCartItemQuantity={this.props.updateCartItemQuantity}
            />
          </div>
        ) : (
          <div className='empty-cart'>
            <div className='empty-cart-icon-wrapper' aria-hidden="true">
              <BagIcon />
            </div>
            <h2 className='empty-cart-title'>Your Cart is Empty</h2>
            <p className='empty-cart-text mb-4'>Explore our collections and add items to your cart!</p>
            <Button
              variant='primary'
              size='md'
              text='Explore Shop'
              onClick={() => {
                toggleCart();
                handleShopping();
              }}
            />
          </div>
        )}
        {cartItems.length > 0 && (
          <div className='cart-checkout'>
            <CartSummary
              cartTotal={cartTotal}
              coupon={coupon}
              discount={discount}
              applyCoupon={applyCoupon}
              removeCoupon={removeCoupon}
            />
            <Checkout
              handleShopping={handleShopping}
              handleCheckout={handleCheckout}
              placeOrder={placeOrder}
              placeGuestOrder={placeGuestOrder}
              authenticated={authenticated}
              addresses={addresses}
              isPlacingOrder={isPlacingOrder}
            />
          </div>
        )}
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    isCartOpen: state.navigation.isCartOpen,
    cartItems: state.cart.cartItems,
    cartTotal: state.cart.cartTotal,
    coupon: state.cart.coupon,
    discount: state.cart.discount,
    authenticated: state.authentication.authenticated,
    addresses: state.address.addresses,
    isPlacingOrder: state.order.isPlacingOrder
  };
};

export default connect(mapStateToProps, actions)(Cart);
