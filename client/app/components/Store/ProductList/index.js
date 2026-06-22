/**
 *
 * ProductList
 *
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react/dist/cjs/lucide-react.cjs';

import AddToWishList from '../AddToWishList';

const ProductList = props => {
  const { products, updateWishlist, authenticated, handleAddToCart } = props;

  return (
    <div className='product-grid-custom'>
      {products.map((product, index) => {
        // Calculate mock original price and discount for visual fidelity matching the redesign brief
        const discountPercentage = Math.floor(10 + (index * 7) % 30); // Staggered mock discount (10% to 40%)
        const originalPrice = parseFloat((product.price / (1 - discountPercentage / 100)).toFixed(2));

        return (
          <motion.div
            key={product._id || index}
            className='product-card-cell'
            data-animate="fade-up"
            whileHover={{ y: -6, scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <div className='product-card-container'>
              {/* Product Card Image Wrapper */}
              <div className='product-card-image-box'>
                {/* Wishlist Button */}
                <div className='wishlist-container-absolute'>
                  <AddToWishList
                    id={product._id}
                    liked={product?.isLiked ?? false}
                    enabled={authenticated}
                    updateWishlist={updateWishlist}
                    authenticated={authenticated}
                  />
                </div>

                {/* Link to Product Detail */}
                <Link to={`/product/${product.slug}`} className='product-image-link'>
                  <div className='image-aspect-wrapper'>
                    <img
                      className='product-card-img'
                      src={`${product.imageUrl ? product.imageUrl : '/images/placeholder-image.png'}`}
                      alt={product.name}
                      loading="lazy"
                    />
                  </div>
                </Link>

                {/* Quick Add Button */}
                <button
                  className='quick-add-btn'
                  onClick={(e) => {
                    e.preventDefault();
                    if (handleAddToCart) {
                      handleAddToCart({ ...product, quantity: 1 });
                    }
                  }}
                >
                  Quick Add
                </button>
              </div>

              {/* Product Card Info Body */}
              <div className='product-card-info p-3'>
                {/* Brand */}
                {product.brand && Object.keys(product.brand).length > 0 && (
                  <div className='product-card-brand'>{product.brand.name}</div>
                )}

                {/* Name */}
                <h3 className='product-card-name-text'>
                  <Link to={`/product/${product.slug}`}>{product.name}</Link>
                </h3>

                {/* Ratings */}
                <div className='product-card-ratings d-flex align-items-center mb-2'>
                  <div className='stars-row mr-2 d-flex align-items-center'>
                    {Array.from({ length: 5 }).map((_, i) => {
                      const ratingVal = product.averageRating || 4.0;
                      const active = i < Math.round(ratingVal);
                      return (
                        <Star
                          key={i}
                          size={14}
                          strokeWidth={1.5}
                          className="mr-0.5"
                          fill={active ? '#FF3D00' : 'none'}
                          color={active ? '#FF3D00' : '#E5E5E3'}
                        />
                      );
                    })}
                  </div>
                  <span className='reviews-count-text'>
                    ({parseFloat(product?.averageRating || 4.2).toFixed(1)}) · {product.totalReviews || 12} reviews
                  </span>
                </div>

                {/* Pricing Footer */}
                <div className='product-card-pricing d-flex align-items-center justify-content-between pt-2'>
                  <div className='price-block d-flex align-items-baseline'>
                    <span className='sale-price mr-2'>₹{product.price}</span>
                    <span className='original-price line-through'>₹{originalPrice}</span>
                  </div>
                  <span className='discount-badge'>-{discountPercentage}%</span>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default ProductList;
