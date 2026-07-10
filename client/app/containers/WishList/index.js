/*
 *
 * WishList
 *
 */

import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react/dist/cjs/lucide-react.cjs';

import actions from '../../actions';
import Button from '../../components/Common/Button';
import WishList from '../../components/Account/WishList';
import LoadingIndicator from '../../components/Common/LoadingIndicator';

class Wishlist extends React.PureComponent {
  componentDidMount() {
    this.props.fetchWishlist();
  }

  render() {
    const { wishlist, isLoading, updateWishlist, handleAddToCart } = this.props;
    const displayWishlist = wishlist.length > 0;

    return (
      <div className='wishlist-page py-5'>
        {isLoading ? (
          <LoadingIndicator />
        ) : (
          <div className='container'>
            <div className='wishlist-header d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-5 pb-3 border-bottom'>
              <div className='mb-3 mb-md-0'>
                <h1 className='wishlist-title mb-1'>Your Wishlist</h1>
                {displayWishlist && (
                  <p className='wishlist-count-text text-muted mb-0'>
                    You have <span className='font-weight-bold text-dark'>{wishlist.length}</span> {wishlist.length === 1 ? 'item' : 'items'} in your wishlist
                  </p>
                )}
              </div>
              {displayWishlist && (
                <div className='wishlist-header-actions d-flex flex-wrap align-items-center'>
                  <Link to='/shop' className='mr-3 mb-2' style={{ textDecoration: 'none' }}>
                    <Button
                      variant='secondary'
                      text='Explore More'
                    />
                  </Link>
                  <div className='mb-2'>
                    <Button
                      variant='primary'
                      text='Add All to Cart'
                      onClick={() => {
                        wishlist.forEach(item => {
                          if (item.product && item.product.quantity > 0) {
                            handleAddToCart({ ...item.product, quantity: 1 });
                          }
                        });
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {displayWishlist ? (
              <WishList
                wishlist={wishlist}
                updateWishlist={updateWishlist}
                handleAddToCart={handleAddToCart}
              />
            ) : (
              <div className='wishlist-empty-state text-center py-5'>
                <div className='empty-heart-icon-wrapper mb-4 d-inline-flex align-items-center justify-content-center'>
                  <Heart size={48} strokeWidth={1} className='text-muted' />
                </div>
                <h2 className='mb-2'>Your Wishlist is Empty</h2>
                <p className='text-muted mb-4'>Explore our collections and add items to your wishlist!</p>
                <Link to='/shop' style={{ textDecoration: 'none' }}>
                  <Button
                    variant='primary'
                    size='lg'
                    text='Explore Shop'
                  />
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    wishlist: state.wishlist.wishlist,
    isLoading: state.wishlist.isLoading
  };
};

export default connect(mapStateToProps, actions)(Wishlist);
