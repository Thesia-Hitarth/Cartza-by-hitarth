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
      authenticated,
      addresses,
      isPlacingOrder
    } = this.props;

    return (
      <div className='cart'>
        <div className='cart-header'>
          <span className='cart-header-title'>
            Your Cart
            {cartItems.length > 0 && <span className='cart-header-count'> ({cartItems.length})</span>}
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
            <BagIcon />
            <p>Your shopping cart is empty</p>
          </div>
        )}
        {cartItems.length > 0 && (
          <div className='cart-checkout'>
            <CartSummary cartTotal={cartTotal} />
            <Checkout
              handleShopping={handleShopping}
              handleCheckout={handleCheckout}
              placeOrder={placeOrder}
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
    authenticated: state.authentication.authenticated,
    addresses: state.address.addresses,
    isPlacingOrder: state.order.isPlacingOrder
  };
};

export default connect(mapStateToProps, actions)(Cart);
