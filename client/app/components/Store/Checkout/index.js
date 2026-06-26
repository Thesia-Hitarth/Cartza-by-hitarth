import React from 'react';
import Button from '../../Common/Button';

class Checkout extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedAddressId: ''
    };
  }

  componentDidMount() {
    this.setDefaultAddress(this.props.addresses);
  }

  componentDidUpdate(prevProps) {
    if (this.props.addresses !== prevProps.addresses) {
      this.setDefaultAddress(this.props.addresses);
    }
  }

  setDefaultAddress(addresses) {
    if (addresses && addresses.length > 0) {
      const defaultAddr = addresses.find(addr => addr.isDefault) || addresses[0];
      this.setState({ selectedAddressId: defaultAddr._id });
    } else {
      this.setState({ selectedAddressId: '' });
    }
  }

  handleAddressChange = (e) => {
    this.setState({ selectedAddressId: e.target.value });
  };

  render() {
    const { authenticated, handleShopping, handleCheckout, placeOrder, addresses, isPlacingOrder } = this.props;
    const { selectedAddressId } = this.state;

    return (
      <div className='easy-checkout'>
        {authenticated && (
          <div className='address-selection-checkout mb-3'>
            <label htmlFor='checkout-address-select' className='address-select-label d-block mb-1'>
              Shipping Address:
            </label>
            {addresses && addresses.length > 0 ? (
              <select
                id='checkout-address-select'
                className='form-control address-select-dropdown'
                value={selectedAddressId}
                onChange={this.handleAddressChange}
              >
                {addresses.map(addr => (
                  <option key={addr._id} value={addr._id}>
                    {`${addr.address}, ${addr.city}, ${addr.state} ${addr.zipCode}`}
                  </option>
                ))}
              </select>
            ) : (
              <div className='no-address-warning text-danger mb-2' style={{ fontSize: '13px' }}>
                No shipping addresses found. Please add an address in your{' '}
                <a href='/dashboard/address' style={{ textDecoration: 'underline', color: 'inherit' }}>
                  Dashboard
                </a>{' '}
                first.
              </div>
            )}
          </div>
        )}
        <div className='checkout-actions'>
          <button className='btn-shopping' onClick={() => handleShopping()}>
            Continue Shopping
          </button>
          {authenticated ? (
            <button
              className={`btn-checkout ${isPlacingOrder ? 'ctz-btn--loading' : ''}`}
              style={{ height: '56px', position: 'relative' }}
              disabled={!selectedAddressId || isPlacingOrder}
              onClick={() => placeOrder(selectedAddressId)}
            >
              {isPlacingOrder && <span className='ctz-btn__spinner' aria-hidden='true' />}
              {!isPlacingOrder && 'Place Order'}
            </button>
          ) : (
            <button className='btn-checkout' style={{ height: '56px' }} onClick={() => handleCheckout()}>
              Proceed to Checkout
            </button>
          )}
        </div>
      </div>
    );
  }
}

export default Checkout;
