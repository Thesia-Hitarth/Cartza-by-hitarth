/**
 *
 * WishList
 *
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Trash2 } from 'lucide-react/dist/cjs/lucide-react.cjs';

const WishList = props => {
  const { wishlist, updateWishlist, handleAddToCart } = props;

  return (
    <div className='wishlist-grid row'>
      {wishlist.map((item, index) => {
        const product = item.product;
        if (!product) return null;

        const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
        const discountPercentage = hasDiscount
          ? Math.round((1 - product.price / product.compareAtPrice) * 100)
          : null;

        return (
          <div key={product._id || index} className='col-12 col-sm-6 col-md-4 col-lg-3 mb-4'>
            <motion.div
              className='wishlist-card-cell'
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div className='wishlist-card-container'>
                <div className='wishlist-image-box position-relative'>
                  {/* Remove Button */}
                  <button
                    className='wishlist-remove-btn'
                    onClick={(e) => {
                      e.preventDefault();
                      updateWishlist(false, product._id);
                    }}
                    aria-label='Remove from wishlist'
                  >
                    <Trash2 size={16} />
                  </button>

                  {/* Product Link */}
                  <Link to={`/product/${product.slug}`} className='wishlist-image-link'>
                    <div className='image-aspect-wrapper'>
                      <img
                        className='wishlist-card-img'
                        src={product.imageUrl ? product.imageUrl : '/images/placeholder-image.png'}
                        alt={product.name}
                        loading="lazy"
                      />
                    </div>
                  </Link>
                </div>

                <div className='wishlist-card-info p-3'>
                  {product.brand && (
                    <div className='wishlist-card-brand'>{product.brand.name}</div>
                  )}
                  <h3 className='wishlist-card-name-text text-truncate'>
                    <Link to={`/product/${product.slug}`}>{product.name}</Link>
                  </h3>
                  
                  <div className='wishlist-card-pricing d-flex align-items-center justify-content-between pt-1 mb-3'>
                    <div className='price-block d-flex align-items-baseline'>
                      <span className='sale-price mr-2'>₹{product.price}</span>
                      {hasDiscount && (
                        <span className='original-price line-through text-muted' style={{ fontSize: '0.8rem', textDecoration: 'line-through' }}>
                          ₹{product.compareAtPrice}
                        </span>
                      )}
                    </div>
                    {hasDiscount && (
                      <span className='discount-badge'>-{discountPercentage}%</span>
                    )}
                  </div>

                  <button
                    className={`wishlist-buy-btn w-100 ${product.quantity <= 0 ? 'disabled' : ''}`}
                    disabled={product.quantity <= 0}
                    onClick={(e) => {
                      e.preventDefault();
                      if (handleAddToCart && product.quantity > 0) {
                        handleAddToCart({ ...product, quantity: 1 });
                      }
                    }}
                  >
                    <ShoppingBag size={14} className='mr-2' />
                    {product.quantity <= 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        );
      })}
    </div>
  );
};

export default WishList;
