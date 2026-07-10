/**
 *
 * ProductPage
 *
 */

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import { Row, Col, Container } from 'reactstrap';
import { ShoppingBag, Star, Check, ChevronDown, ChevronUp } from 'lucide-react/dist/cjs/lucide-react.cjs';

import actions from '../../actions';
import Input from '../../components/Common/Input';
import LoadingIndicator from '../../components/Common/LoadingIndicator';
import NotFound from '../../components/Common/NotFound';
import ProductReviews from '../../components/Store/ProductReviews';
import SocialShare from '../../components/Store/SocialShare';
import ImageGallery from '../../components/Store/Product/ImageGallery';
import VariantSelector from '../../components/Store/Product/VariantSelector';
import { useRecentlyViewed } from '../../hooks/useRecentlyViewed';
import axios from 'axios';
import { API_URL } from '../../constants';
import { getCloudinaryUrl } from '../../utils/cloudinary';

const updateMetaTag = (attrName, attrValue, content) => {
  if (typeof window === 'undefined') return;
  let element = document.querySelector(`meta[${attrName}="${attrValue}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attrName, attrValue);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content || '');
};

const ProductPage = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();

  // State hooks
  const [selectedColor, setSelectedColor] = useState('Default');
  const [selectedSize, setSelectedSize] = useState('Default');
  const [openAccordion, setOpenAccordion] = useState('description');
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [, addProductToRecentlyViewed] = useRecentlyViewed();

  // Redux Selectors
  const product = useSelector(state => state.product.storeProduct);
  const productShopData = useSelector(state => state.product.productShopData);
  const shopFormErrors = useSelector(state => state.product.shopFormErrors);
  const isLoading = useSelector(state => state.product.isLoading);
  const reviews = useSelector(state => state.review.productReviews);
  const reviewsSummary = useSelector(state => state.review.reviewsSummary);
  const reviewFormData = useSelector(state => state.review.reviewFormData);
  const reviewFormErrors = useSelector(state => state.review.reviewFormErrors);

  const itemInCart = useSelector(state =>
    state.cart.cartItems.some(item => item._id === product?._id)
  );

  // Fetch product data and reviews
  useEffect(() => {
    dispatch(actions.fetchStoreProduct(slug));
    dispatch(actions.fetchProductReviews(slug));
    document.body.classList.add('product-page');
    return () => {
      document.body.classList.remove('product-page');
    };
  }, [slug, dispatch]);

  // Update default color/size when product changes
  useEffect(() => {
    if (product && Object.keys(product).length > 0) {
      const colors = product.colors || [];
      const sizes = product.sizes || [];
      setSelectedColor(colors.length > 0 ? colors[0] : 'Default');
      setSelectedSize(sizes.length > 0 ? sizes[0] : 'Default');

      // Meta Tags
      document.title = `${product.name} | CARTZA`;
      updateMetaTag('property', 'og:title', `${product.name} | CARTZA`);
      updateMetaTag('name', 'description', product.description || '');
      updateMetaTag('property', 'og:description', product.description || '');
      updateMetaTag('property', 'og:image', product.imageUrl || '/images/placeholder-image.png');

      // Update JSON-LD schema dynamically
      let schemaScript = document.getElementById('product-schema-jsonld');
      if (!schemaScript) {
        schemaScript = document.createElement('script');
        schemaScript.id = 'product-schema-jsonld';
        schemaScript.type = 'application/ld+json';
        document.head.appendChild(schemaScript);
      }
      const schemaData = {
        '@context': 'https://schema.org/',
        '@type': 'Product',
        'name': product.name,
        'image': product.imageUrl || '',
        'description': product.description || '',
        'sku': product.sku || '',
        'offers': {
          '@type': 'Offer',
          'priceCurrency': 'INR',
          'price': product.price,
          'availability': product.quantity > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
        }
      };
      schemaScript.innerHTML = JSON.stringify(schemaData);

      // Add to recently viewed via hook
      addProductToRecentlyViewed(product);
    }
  }, [product, addProductToRecentlyViewed]);

  useEffect(() => {
    if (product && product._id) {
      axios.get(`${API_URL}/product/related/${product._id}`)
        .then(res => {
          setRelatedProducts(res.data.products || []);
        })
        .catch(err => {
          console.error('Failed to fetch related products', err);
        });
    }
  }, [product]);

  const toggleAccordion = (section) => {
    setOpenAccordion(prev => prev === section ? null : section);
  };

  const scrollToReviews = () => {
    const el = document.getElementById('reviews');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (isLoading) {
    return <div className="product-shop-redesign py-4"><LoadingIndicator /></div>;
  }

  if (!product || Object.keys(product).length === 0) {
    return <NotFound message='No product found.' />;
  }

  let productImages = ['/images/placeholder-image.png'];
  if (product.images && product.images.length > 0) {
    productImages = product.images.map(img => img.url);
  } else if (product.imageUrl) {
    productImages = [product.imageUrl];
  }

  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercentage = hasDiscount
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;
  const originalPrice = hasDiscount ? product.compareAtPrice : null;

  const hasVariants = product.variants && product.variants.length > 0;
  let currentQty = product.quantity || 0;
  if (hasVariants) {
    const activeVariant = product.variants.find(
      v => v.color === selectedColor && v.size === selectedSize
    );
    currentQty = activeVariant ? activeVariant.quantity : 0;
  }

  const isColorDisabled = col => {
    if (!hasVariants) return false;
    const colVariants = product.variants.filter(v => v.color === col);
    return colVariants.length > 0 && colVariants.every(v => v.quantity <= 0);
  };

  const isSizeDisabled = sz => {
    if (!hasVariants) return false;
    const sizeVariant = product.variants.find(v => v.color === selectedColor && v.size === sz);
    return !sizeVariant || sizeVariant.quantity <= 0;
  };

  return (
    <div className='product-shop-redesign py-4'>
      <Container>
        {/* Breadcrumb / Top Bar */}
        <nav aria-label="breadcrumb" className='product-breadcrumb mb-4'>
          <ol className="breadcrumb-list d-flex align-items-center list-unstyled mb-0">
            <li className="breadcrumb-item"><Link to='/shop'>Shop</Link></li>
            {product.brand && (
              <>
                <li className="breadcrumb-separator mx-2" aria-hidden="true">/</li>
                <li className="breadcrumb-item">
                  <Link to={`/shop/brand/${product.brand.slug}`}>{product.brand.name}</Link>
                </li>
              </>
            )}
            <li className="breadcrumb-separator mx-2" aria-hidden="true">/</li>
            <li className="breadcrumb-item active" aria-current="page">
              <span>{product.name}</span>
            </li>
          </ol>
        </nav>

        <Row className='flex-row'>
          {/* Left Column: Image Gallery (60% split) */}
          <Col xs='12' lg='7' className='mb-4 pr-lg-5'>
            <ImageGallery images={productImages} currentQty={currentQty} />
          </Col>

          {/* Right Column: Product Detail Panel (40% split) */}
          <Col xs='12' lg='5' className='mb-4'>
            <div className='product-detail-panel'>
              {product.brand && (
                <div className='product-brand-eyebrow mb-2'>
                  <Link to={`/shop/brand/${product.brand.slug}`}>
                    {product.brand.name}
                  </Link>
                </div>
              )}

              <h1 className='product-title-display'>{product.name}</h1>

              <div className='rating-reviews-line d-flex align-items-center mb-3' onClick={scrollToReviews}>
                <div
                  className='rating-stars-row mr-2 d-flex align-items-center'
                  role='img'
                  aria-label={`Rating: ${reviews.length > 0 ? (reviewsSummary?.ratingAverage || 0) : 0} out of 5 stars`}
                >
                  {Array.from({ length: 5 }).map((_, i) => {
                    const active = i < Math.round(reviews.length > 0 ? (reviewsSummary?.ratingAverage || 0) : 0);
                    return (
                      <Star
                        key={i}
                        size={16}
                        strokeWidth={1.5}
                        className="mr-0.5"
                        fill={active ? '#FF3D00' : 'none'}
                        color={active ? '#FF3D00' : '#E5E5E3'}
                        aria-hidden='true'
                      />
                    );
                  })}
                </div>
                <span className='reviews-link'>
                  {reviews.length > 0 ? (
                    <>{parseFloat(reviewsSummary?.ratingAverage || 0).toFixed(1)} ({reviews.length} customer reviews)</>
                  ) : (
                    'No reviews yet'
                  )}
                </span>
              </div>

              <div className='price-row-display d-flex align-items-center mb-4'>
                <span className='current-price mr-3'>₹{product.price}</span>
                {hasDiscount && (
                  <>
                    <span className='original-price strike-through mr-3'>₹{originalPrice}</span>
                    <span className='badge-discount'>-{discountPercentage}% Off</span>
                  </>
                )}
              </div>

              <p className='product-description-short mb-4'>{product.description}</p>

              <hr className='divider-line' />

              {/* Variant Selector */}
              <VariantSelector
                colors={product.colors}
                sizes={product.sizes}
                selectedColor={selectedColor}
                selectedSize={selectedSize}
                onColorSelect={(col) => {
                  setSelectedColor(col);
                  const availableVariant = product.variants && product.variants.find(v => v.color === col && v.quantity > 0);
                  if (availableVariant) {
                    setSelectedSize(availableVariant.size);
                  }
                }}
                onSizeSelect={(sz) => setSelectedSize(sz)}
                isColorDisabled={isColorDisabled}
                isSizeDisabled={isSizeDisabled}
              />

              {currentQty > 0 && currentQty <= 5 && (
                <div className='stock-urgency-warning text-danger mb-3' style={{ fontWeight: 500 }}>
                  ⚠️ Only {currentQty} left in stock - order soon!
                </div>
              )}

              <div className='quantity-input-box mb-4'>
                <Input
                  type={'number'}
                  error={shopFormErrors['quantity']}
                  label={'Quantity'}
                  name={'quantity'}
                  decimals={false}
                  min={1}
                  max={currentQty}
                  placeholder={'Product Quantity'}
                  disabled={currentQty <= 0 && !shopFormErrors['quantity']}
                  value={productShopData.quantity}
                  onInputChange={(name, value) => {
                    dispatch(actions.productShopChange(name, value));
                  }}
                />
              </div>

              <div className='action-buttons-full-width mb-4'>
                {itemInCart ? (
                  <button
                    className='btn-cart-page-remove d-flex align-items-center justify-content-center'
                    disabled={currentQty <= 0 && !shopFormErrors['quantity']}
                    onClick={() => dispatch(actions.handleRemoveFromCart(product))}
                  >
                    <ShoppingBag size={20} strokeWidth={1.5} />
                    <span className='ml-2'>Remove From Bag</span>
                  </button>
                ) : (
                  <button
                    className='btn-cart-page-add d-flex align-items-center justify-content-center'
                    disabled={currentQty <= 0 || isAddingToCart}
                    onClick={() => {
                      setIsAddingToCart(true);
                      const shopQuantity = Number(productShopData.quantity || 1);
                      dispatch(actions.handleAddToCart({
                        ...product,
                        quantity: shopQuantity,
                        color: selectedColor,
                        size: selectedSize
                      }));
                      setTimeout(() => {
                        setIsAddingToCart(false);
                      }, 800);
                    }}
                  >
                    <ShoppingBag size={20} strokeWidth={1.5} />
                    <span className='ml-2'>{isAddingToCart ? 'Adding...' : 'Add To Bag'}</span>
                  </button>
                )}
              </div>

              <div className='trust-badges-grid d-flex justify-content-between mb-4'>
                <div className='trust-item text-center'>
                  <div className='trust-icon-box mx-auto mb-1 d-flex align-items-center justify-content-center'>
                    <Check size={14} strokeWidth={2.5} className="text-success" />
                  </div>
                  <span>Free Shipping</span>
                </div>
                <div className='trust-item text-center'>
                  <div className='trust-icon-box mx-auto mb-1 d-flex align-items-center justify-content-center'>
                    <Check size={14} strokeWidth={2.5} className="text-success" />
                  </div>
                  <span>Easy Returns</span>
                </div>
                <div className='trust-item text-center'>
                  <div className='trust-icon-box mx-auto mb-1 d-flex align-items-center justify-content-center'>
                    <Check size={14} strokeWidth={2.5} className="text-success" />
                  </div>
                  <span>Secure Checkout</span>
                </div>
              </div>

              <div className='share-block py-2 mb-4'>
                <SocialShare product={product} />
              </div>

              <div className='accordion-section-block'>
                <div className='accordion-card'>
                  <button
                    className='accordion-header-btn d-flex justify-content-between align-items-center'
                    onClick={() => toggleAccordion('description')}
                    aria-expanded={openAccordion === 'description'}
                  >
                    <span>Description</span>
                    <span className='accordion-arrow'>{openAccordion === 'description' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</span>
                  </button>
                  <div className={`accordion-collapse-body ${openAccordion === 'description' ? 'open' : ''}`}>
                    <div className='accordion-inner-content'>
                      {product.description}
                    </div>
                  </div>
                </div>

                <div className='accordion-card'>
                  <button
                    className='accordion-header-btn d-flex justify-content-between align-items-center'
                    onClick={() => toggleAccordion('specs')}
                    aria-expanded={openAccordion === 'specs'}
                  >
                    <span>Specifications</span>
                    <span className='accordion-arrow'>{openAccordion === 'specs' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</span>
                  </button>
                  <div className={`accordion-collapse-body ${openAccordion === 'specs' ? 'open' : ''}`}>
                    <div className='accordion-inner-content'>
                      <table className='table table-borderless table-sm mb-0'>
                        <tbody>
                          <tr>
                            <td>SKU</td>
                            <td className='text-right'>{product.sku || 'N/A'}</td>
                          </tr>
                          <tr>
                            <td>Taxable</td>
                            <td className='text-right'>{product.taxable ? 'Yes' : 'No'}</td>
                          </tr>
                          <tr>
                            <td>Inventory</td>
                            <td className='text-right'>{product.quantity || 'Out of stock'}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div className='accordion-card'>
                  <button
                    className='accordion-header-btn d-flex justify-content-between align-items-center'
                    onClick={() => toggleAccordion('shipping')}
                    aria-expanded={openAccordion === 'shipping'}
                  >
                    <span>Shipping & Returns</span>
                    <span className='accordion-arrow'>{openAccordion === 'shipping' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</span>
                  </button>
                  <div className={`accordion-collapse-body ${openAccordion === 'shipping' ? 'open' : ''}`}>
                    <div className='accordion-inner-content'>
                      Free standard delivery on orders above ₹999. Returns accepted within 10 days of delivery. Terms and conditions apply.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Col>
        </Row>

        <div id='reviews' className='mt-5'>
          <ProductReviews
            reviewFormData={reviewFormData}
            reviewFormErrors={reviewFormErrors}
            reviews={reviews}
            reviewsSummary={reviewsSummary}
            reviewChange={(name, value) => dispatch(actions.reviewChange(name, value))}
            addReview={() => dispatch(actions.addProductReview())}
          />
        </div>

        {/* Related Products Section */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div className='related-products-section mt-5 border-top pt-5'>
            <h3 className='mb-4 text-center' style={{ fontWeight: 600 }}>You May Also Like</h3>
            <Row>
              {relatedProducts.map(p => (
                <Col xs='6' md='3' key={p._id} className='mb-4'>
                  <div className='related-product-card border p-2 h-100 d-flex flex-column bg-white' style={{ transition: 'box-shadow 0.2s' }}>
                    <Link to={`/product/${p.slug}`} className='text-decoration-none text-dark flex-grow-1'>
                      <div className='related-image-wrapper mb-2' style={{ height: '200px', overflow: 'hidden' }}>
                        <img
                          src={getCloudinaryUrl(p.imageUrl, 300)}
                          alt={p.name}
                          className='w-100 h-100 object-fit-cover'
                          loading="lazy"
                          width={300}
                          height={200}
                        />
                      </div>
                      <div className='related-info px-1'>
                        {p.brand && <div className='text-muted small mb-1'>{p.brand.name}</div>}
                        <h5 className='product-name-title text-truncate' style={{ fontSize: '14px', margin: '0 0 5px', fontWeight: 500 }}>{p.name}</h5>
                        <div className='product-price text-danger' style={{ fontWeight: 'bold' }}>₹{p.price}</div>
                      </div>
                    </Link>
                  </div>
                </Col>
              ))}
            </Row>
          </div>
        )}
      </Container>
    </div>
  );
};

export default ProductPage;
