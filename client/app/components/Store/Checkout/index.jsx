import React, { useState, useEffect } from 'react';

const Checkout = ({
  authenticated,
  handleShopping,
  handleCheckout,
  placeOrder,
  placeGuestOrder,
  addresses,
  isPlacingOrder
}) => {
  const [selectedAddressId, setSelectedAddressId] = useState('');

  // Guest details form state
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [guestEmail, setGuestEmail] = useState('');
  const [guestFirstName, setGuestFirstName] = useState('');
  const [guestLastName, setGuestLastName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestAddress, setGuestAddress] = useState('');
  const [guestCity, setGuestCity] = useState('');
  const [guestState, setGuestState] = useState('');
  const [guestZipCode, setGuestZipCode] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (addresses && addresses.length > 0) {
      const defaultAddr = addresses.find(addr => addr.isDefault) || addresses[0];
      setSelectedAddressId(defaultAddr._id);
    } else {
      setSelectedAddressId('');
    }
  }, [addresses]);

  const handlePlaceGuestOrder = () => {
    if (
      !guestEmail ||
      !guestFirstName ||
      !guestLastName ||
      !guestPhone ||
      !guestAddress ||
      !guestCity ||
      !guestState ||
      !guestZipCode
    ) {
      setFormError('Please fill out all contact and delivery fields.');
      return;
    }
    setFormError('');
    if (placeGuestOrder) {
      placeGuestOrder({
        email: guestEmail,
        firstName: guestFirstName,
        lastName: guestLastName,
        phone: guestPhone,
        address: guestAddress,
        city: guestCity,
        state: guestState,
        zipCode: guestZipCode
      });
    }
  };

  return (
    <div className='easy-checkout tw-font-body'>
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
              onChange={(e) => setSelectedAddressId(e.target.value)}
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

      {/* Guest Checkout Form */}
      {!authenticated && isGuestMode && (
        <div className='guest-checkout-form p-3 mb-3 border rounded bg-light'>
          <h5 className='mb-3 text-dark' style={{ fontWeight: 600 }}>Delivery Details (Guest)</h5>
          
          {formError && (
            <div className='alert alert-danger py-2 px-3 mb-3' style={{ fontSize: '13px' }}>
              {formError}
            </div>
          )}

          <div className='row'>
            <div className='col-12 mb-2'>
              <input
                type='email'
                placeholder='Email Address *'
                className='form-control'
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
              />
            </div>
            <div className='col-6 mb-2'>
              <input
                type='text'
                placeholder='First Name *'
                className='form-control'
                value={guestFirstName}
                onChange={(e) => setGuestFirstName(e.target.value)}
              />
            </div>
            <div className='col-6 mb-2'>
              <input
                type='text'
                placeholder='Last Name *'
                className='form-control'
                value={guestLastName}
                onChange={(e) => setGuestLastName(e.target.value)}
              />
            </div>
            <div className='col-12 mb-2'>
              <input
                type='tel'
                placeholder='Phone Number *'
                className='form-control'
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
              />
            </div>
            <div className='col-12 mb-2'>
              <input
                type='text'
                placeholder='Shipping Address *'
                className='form-control'
                value={guestAddress}
                onChange={(e) => setGuestAddress(e.target.value)}
              />
            </div>
            <div className='col-4 mb-2'>
              <input
                type='text'
                placeholder='City *'
                className='form-control'
                value={guestCity}
                onChange={(e) => setGuestCity(e.target.value)}
              />
            </div>
            <div className='col-4 mb-2'>
              <input
                type='text'
                placeholder='State *'
                className='form-control'
                value={guestState}
                onChange={(e) => setGuestState(e.target.value)}
              />
            </div>
            <div className='col-4 mb-2'>
              <input
                type='text'
                placeholder='Zip Code *'
                className='form-control'
                value={guestZipCode}
                onChange={(e) => setGuestZipCode(e.target.value)}
              />
            </div>
          </div>

          <div className='d-flex mt-3 gap-2'>
            <button
              className='btn btn-outline-secondary btn-sm mr-2'
              onClick={() => setIsGuestMode(false)}
            >
              Back
            </button>
            <button
              className='btn btn-primary btn-sm flex-grow-1'
              disabled={isPlacingOrder}
              onClick={handlePlaceGuestOrder}
            >
              {isPlacingOrder ? 'Placing Order...' : 'Place Guest Order'}
            </button>
          </div>
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
          !isGuestMode && (
            <div className='d-flex flex-column w-100 gap-2 mt-2'>
              <button
                className='btn-checkout mb-2'
                style={{ height: '56px' }}
                onClick={() => handleCheckout()}
              >
                Proceed to Checkout
              </button>
              <button
                className='btn btn-outline-dark w-100 py-3'
                style={{ borderRadius: '0', fontSize: '14px', letterSpacing: '0.05em' }}
                onClick={() => setIsGuestMode(true)}
              >
                Checkout as Guest
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Checkout;
