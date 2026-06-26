/**
 *
 * ProductPage
 *
 */

import React from 'react';
import { connect } from 'react-redux';
import { Row, Col, Container } from 'reactstrap';
import { Link } from 'react-router-dom';

import actions from '../../actions';
import { withRouter } from '../../utils/withRouter';
import Input from '../../components/Common/Input';
import Button from '../../components/Common/Button';
import LoadingIndicator from '../../components/Common/LoadingIndicator';
import NotFound from '../../components/Common/NotFound';
import { ShoppingBag, Star, Check, ChevronDown, ChevronUp } from 'lucide-react/dist/cjs/lucide-react.cjs';
import ProductReviews from '../../components/Store/ProductReviews';
import SocialShare from '../../components/Store/SocialShare';

const updateMetaTag = (property, content) => {
  if (typeof window === 'undefined') return;
  let element = document.querySelector(`meta[property="${property}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute('property', property);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
};


class ProductPage extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      activeThumbIdx: 0,
      isZoomed: false,
      zoomPos: 'center',
      selectedColor: 'Default',
      selectedSize: 'Default',
      openAccordion: 'description' // 'description', 'specs', 'shipping'
    };
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);
    this.toggleAccordion = this.toggleAccordion.bind(this);
    this.scrollToReviews = this.scrollToReviews.bind(this);
  }

  componentDidMount() {
    const slug = this.props.match.params.slug;
    this.props.fetchStoreProduct(slug);
    this.props.fetchProductReviews(slug);
    document.body.classList.add('product-page');
    this.updatePageMeta();
  }

  componentDidUpdate(prevProps) {
    if (this.props.match.params.slug !== prevProps.match.params.slug) {
      const slug = this.props.match.params.slug;
      this.props.fetchStoreProduct(slug);
      this.props.fetchProductReviews(slug);
    }
    if (this.props.product !== prevProps.product && this.props.product) {
      const colors = this.props.product.colors || [];
      const sizes = this.props.product.sizes || [];
      this.setState({
        selectedColor: colors.length > 0 ? colors[0] : 'Default',
        selectedSize: sizes.length > 0 ? sizes[0] : 'Default'
      });
      this.updatePageMeta();
    }
  }

  updatePageMeta() {
    const { product } = this.props;
    if (product && Object.keys(product).length > 0) {
      document.title = `${product.name} | CARTZA`;
      updateMetaTag('og:title', `${product.name} | CARTZA`);
      updateMetaTag('og:description', product.description || '');
      updateMetaTag('og:image', product.imageUrl || '/images/placeholder-image.png');
      
      const recentlyViewed = JSON.parse(localStorage.getItem('cartza_recently_viewed') || '[]');
      const filtered = recentlyViewed.filter(p => p._id !== product._id);
      filtered.unshift(product);
      localStorage.setItem('cartza_recently_viewed', JSON.stringify(filtered.slice(0, 4)));
    }
  }

  componentWillUnmount() {
    document.body.classList.remove('product-page');
  }

  handleMouseMove(e) {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    this.setState({
      zoomPos: `${x}% ${y}%`,
      isZoomed: true
    });
  }

  handleMouseLeave() {
    this.setState({ isZoomed: false });
  }

  toggleAccordion(section) {
    this.setState(prevState => ({
      openAccordion: prevState.openAccordion === section ? null : section
    }));
  }

  scrollToReviews() {
    const el = document.getElementById('reviews');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }

  render() {
    const {
      isLoading,
      product,
      productShopData,
      shopFormErrors,
      itemInCart,
      productShopChange,
      handleAddToCart,
      handleRemoveFromCart,
      addProductReview,
      reviewsSummary,
      reviews,
      reviewFormData,
      reviewChange,
      reviewFormErrors
    } = this.props;

    const { activeThumbIdx, isZoomed, zoomPos, selectedColor, selectedSize, openAccordion } = this.state;

    const productImages = product.imageUrl ? [product.imageUrl] : ['/images/placeholder-image.png'];
    const currentImage = productImages[activeThumbIdx] || productImages[0];

    // Dynamic discount calculations
    const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
    const discountPercentage = hasDiscount
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : 0;
    const originalPrice = hasDiscount ? product.compareAtPrice : null;

    return (
      <div className='product-shop-redesign py-4'>
        {isLoading ? (
          <LoadingIndicator />
        ) : Object.keys(product).length > 0 ? (
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
                <div className='product-gallery'>
                  {/* Primary Zoom Image */}
                  <div
                    className='primary-image-container'
                    onMouseMove={this.handleMouseMove}
                    onMouseLeave={this.handleMouseLeave}
                    style={{ cursor: 'zoom-in' }}
                  >
                    <div
                      className='zoom-target-image'
                      style={{
                        backgroundImage: `url(${currentImage})`,
                        backgroundPosition: isZoomed ? zoomPos : 'center',
                        backgroundSize: isZoomed ? '200%' : 'contain',
                        backgroundRepeat: 'no-repeat'
                      }}
                    />
                    {product.quantity <= 0 ? (
                      <span className='stock-badge out-of-stock'>Sold Out</span>
                    ) : (
                      <span className='stock-badge in-stock'>In Stock</span>
                    )}
                  </div>

                  {/* Thumbnail Strip */}
                  {productImages.length > 1 && (
                    <div className='thumbnail-strip d-flex mt-3'>
                      {productImages.map((thumb, idx) => (
                        <button
                          key={idx}
                          className={`thumb-button ${activeThumbIdx === idx ? 'active' : ''}`}
                          onClick={() => this.setState({ activeThumbIdx: idx })}
                          aria-label={`Select image variant ${idx + 1}`}
                        >
                          <img src={thumb} alt='' className='thumb-img' />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </Col>

              {/* Right Column: Product Detail Panel (40% split) */}
              <Col xs='12' lg='5' className='mb-4'>
                <div className='product-detail-panel'>
                  {/* Brand Link */}
                  {product.brand && (
                    <div className='product-brand-eyebrow mb-2'>
                      <Link to={`/shop/brand/${product.brand.slug}`}>
                        {product.brand.name}
                      </Link>
                    </div>
                  )}

                  {/* Title */}
                  <h1 className='product-title-display'>{product.name}</h1>

                  {/* Rating summary */}
                  <div className='rating-reviews-line d-flex align-items-center mb-3' onClick={this.scrollToReviews}>
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
                        <>
                          {parseFloat(reviewsSummary?.ratingAverage || 0).toFixed(1)} ({reviews.length} customer reviews)
                        </>
                      ) : (
                        'No reviews yet'
                      )}
                    </span>
                  </div>

                  {/* Price */}
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

                  {/* Custom Swatch Selectors */}
                  {/* Color Swatch */}
                  {product.colors && product.colors.length > 0 && (
                    <div className='variant-swatch-block mb-3'>
                      <div className='variant-label'>Color: <strong>{selectedColor}</strong></div>
                      <div className='color-swatch-list d-flex align-items-center'>
                        {product.colors.map((col, idx) => (
                          <button
                            key={idx}
                            className={`color-swatch-btn ${selectedColor === col ? 'active' : ''} ${col.toLowerCase().replace(/\s+/g, '-')}`}
                            onClick={() => this.setState({ selectedColor: col })}
                            title={col}
                            aria-label={`Select color ${col}`}
                          ></button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Size Selectors */}
                  {product.sizes && product.sizes.length > 0 && (
                    <div className='variant-swatch-block mb-4'>
                      <div className='variant-label'>Size: <strong>{selectedSize}</strong></div>
                      <div className='size-swatch-list d-flex align-items-center'>
                        {product.sizes.map((sz, idx) => (
                          <button
                            key={idx}
                            className={`size-swatch-btn ${selectedSize === sz ? 'active' : ''}`}
                            onClick={() => this.setState({ selectedSize: sz })}
                            aria-label={`Select size ${sz}`}
                          >
                            {sz}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quantity and Actions */}
                  <div className='quantity-input-box mb-4'>
                    <Input
                      type={'number'}
                      error={shopFormErrors['quantity']}
                      label={'Quantity'}
                      name={'quantity'}
                      decimals={false}
                      min={1}
                      max={product.quantity}
                      placeholder={'Product Quantity'}
                      disabled={product.quantity <= 0 && !shopFormErrors['quantity']}
                      value={productShopData.quantity}
                      onInputChange={(name, value) => {
                        productShopChange(name, value);
                      }}
                    />
                  </div>

                  {/* Add To Cart Full Width */}
                  <div className='action-buttons-full-width mb-4'>
                    {itemInCart ? (
                      <button
                        className='btn-cart-page-remove d-flex align-items-center justify-content-center'
                        disabled={product.quantity <= 0 && !shopFormErrors['quantity']}
                        onClick={() => handleRemoveFromCart(product)}
                      >
                        <ShoppingBag size={20} strokeWidth={1.5} />
                        <span className='ml-2'>Remove From Bag</span>
                      </button>
                    ) : (
                      <button
                        className='btn-cart-page-add d-flex align-items-center justify-content-center'
                        disabled={product.quantity <= 0}
                        onClick={() => {
                          const shopQuantity = Number(productShopData.quantity || 1);
                          handleAddToCart({ ...product, quantity: shopQuantity });
                        }}
                      >
                        <ShoppingBag size={20} strokeWidth={1.5} />
                        <span className='ml-2'>Add To Bag</span>
                      </button>
                    )}
                  </div>

                  {/* Trust Badges */}
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

                  {/* Share */}
                  <div className='share-block py-2 mb-4'>
                    <SocialShare product={product} />
                  </div>

                  {/* Accordion Panels */}
                  <div className='accordion-section-block'>
                    {/* Description */}
                    <div className='accordion-card'>
                      <button
                        className='accordion-header-btn d-flex justify-content-between align-items-center'
                        onClick={() => this.toggleAccordion('description')}
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

                    {/* Specifications */}
                    <div className='accordion-card'>
                      <button
                        className='accordion-header-btn d-flex justify-content-between align-items-center'
                        onClick={() => this.toggleAccordion('specs')}
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

                    {/* Shipping & Returns */}
                    <div className='accordion-card'>
                      <button
                        className='accordion-header-btn d-flex justify-content-between align-items-center'
                        onClick={() => this.toggleAccordion('shipping')}
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
                reviewChange={reviewChange}
                addReview={addProductReview}
              />
            </div>
          </Container>
        ) : (
          <NotFound message='No product found.' />
        )}
      </div>
    );
  }
}

const mapStateToProps = state => {
  const itemInCart = state.cart.cartItems.find(
    item => item._id === state.product.storeProduct?._id
  )
    ? true
    : false;

  return {
    product: state.product.storeProduct,
    productShopData: state.product.productShopData,
    shopFormErrors: state.product.shopFormErrors,
    isLoading: state.product.isLoading,
    reviews: state.review.productReviews,
    reviewsSummary: state.review.reviewsSummary,
    reviewFormData: state.review.reviewFormData,
    reviewFormErrors: state.review.reviewFormErrors,
    itemInCart
  };
};

export default withRouter(connect(mapStateToProps, actions)(ProductPage));
