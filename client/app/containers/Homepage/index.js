/**
 *
 * Homepage — CARTZA Premium Editorial Experience
 *
 * 8 Sections:
 * 1. Video/Ken Burns Hero (full viewport)
 * 2. Marquee Strip
 * 3. Category Editorial Grid (asymmetric)
 * 4. Trending Now Carousel
 * 5. Editorial Split — "The Cartza Story"
 * 6. New Arrivals Grid
 * 7. Recently Viewed (conditional)
 * 8. Newsletter band
 *
 */

import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { Container } from 'reactstrap';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react/dist/cjs/lucide-react.cjs';
import { Helmet } from 'react-helmet-async';

import actions from '../../actions';
import { useRecentlyViewed } from '../../hooks/useRecentlyViewed';
import Marquee from '../../components/Common/Marquee';
import SectionHeader from '../../components/Common/SectionHeader';
import CarouselSlider from '../../components/Common/CarouselSlider';
import ProductList from '../../components/Store/ProductList';

const responsive = {
  desktop: {
    breakpoint: { max: 3000, min: 1024 },
    items: 3,
    slidesToSlide: 1
  },
  tablet: {
    breakpoint: { max: 1024, min: 464 },
    items: 2,
    slidesToSlide: 1
  },
  mobile: {
    breakpoint: { max: 464, min: 0 },
    items: 1,
    slidesToSlide: 1
  }
};

const getCategoryBanner = (name = '') => {
  const categoryName = (name || '').toLowerCase();
  if (categoryName.includes('women')) {
    return '/images/banners/women.jpg';
  }
  if (categoryName.includes('men')) {
    return '/images/banners/men.jpg';
  }
  if (categoryName.includes('kid')) {
    return '/images/banners/kids.jpg';
  }
  return null;
};

// Animation variants
const heroTextVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: 0.3 + i * 0.2, ease: [0.16, 1, 0.3, 1] }
  })
};

const Homepage = () => {
  const dispatch = useDispatch();

  const categories = useSelector(state => state.category.storeCategories);
  const products = useSelector(state => state.product.storeProducts);
  const email = useSelector(state => state.newsletter.email);
  const formErrors = useSelector(state => state.newsletter.formErrors);
  const authenticated = useSelector(state => state.authentication.authenticated);

  const [recentlyViewed] = useRecentlyViewed();

  useEffect(() => {
    document.title = 'CARTZA | Premium Curated Fashion & Electronics';
    dispatch(actions.fetchStoreCategories());
    dispatch(actions.filterProducts('all', 'all'));
  }, [dispatch]);

  const handleSubmit = event => {
    event.preventDefault();
    dispatch(actions.subscribeToNewsletter());
  };

  const updateWishlist = (product) => dispatch(actions.updateWishlist(product));
  const handleAddToCart = (product) => dispatch(actions.handleAddToCart(product));

  return (
    <div className='homepage-redesign'>
      <Helmet>
        <title>Cartza | Premium Editorial E-Commerce Experience</title>
        <meta name="description" content="Discover the season's most refined collections. Curated fashion, electronics & lifestyle accessories crafted for those who live with intention." />
        <meta property="og:title" content="Cartza | Premium Editorial E-Commerce Experience" />
        <meta property="og:description" content="Discover the season's most refined collections. Curated fashion, electronics & lifestyle accessories." />
        <meta property="og:image" content="https://cartza-by-hitarth.vercel.app/images/banners/men.jpg" />
        <meta property="og:url" content="https://cartza-by-hitarth.vercel.app/" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      {/* SECTION 1: HERO */}
      <section className='hero-section'>
        <div className='hero-bg-image'></div>
        <div className='hero-overlay'></div>
        <div className='hero-content-layer'>
          <Container>
            <motion.div
              className='hero-content-inner'
              initial="hidden"
              animate="visible"
            >
              <motion.span className='hero-mono-tag' custom={0} variants={heroTextVariants}>
                — NEW COLLECTION SS&apos;26
              </motion.span>
              <motion.h1 className='hero-headline' custom={1} variants={heroTextVariants}>
                <span className='hero-line-italic'>Style Is</span>
                <span className='hero-line-roman'>Not Loud.</span>
              </motion.h1>
              <motion.p className='hero-subcopy' custom={2} variants={heroTextVariants}>
                Discover the season&apos;s most refined pieces — curated fashion, electronics & lifestyle for those who live with intention.
              </motion.p>
              <motion.div className='hero-cta-row' custom={3} variants={heroTextVariants}>
                <Link to='/shop' className='btn-primary' data-cursor="link">
                  <span>EXPLORE COLLECTION</span>
                </Link>
                <Link to='/brands' className='btn-ghost' data-cursor="link">
                  DISCOVER BRANDS <span className='arrow'>→</span>
                </Link>
              </motion.div>
            </motion.div>
          </Container>
        </div>
      </section>

      {/* SECTION 2: MARQUEE STRIP */}
      <Marquee speed={28} bg="accent" textColor="white">
        FREE DELIVERY ON ₹999+  ✦  NEW ARRIVALS EVERY MONDAY  ✦  30-DAY RETURNS  ✦  4.9★ RATED  ✦  FREE DELIVERY ON ₹999+  ✦  NEW ARRIVALS EVERY MONDAY  ✦  30-DAY RETURNS  ✦  4.9★ RATED  ✦
      </Marquee>

      {/* SECTION 3: CATEGORY EDITORIAL GRID */}
      {categories && categories.length > 0 && (
        <section className='section-categories' data-animate="fade-up">
          <Container>
            <SectionHeader number="01" title="Shop by Category" link="/shop" linkText="View All" />

            <div className='category-editorial-grid'>
              {categories[0] && (
                <Link
                  to={`/shop/category/${categories[0].slug}`}
                  className='cat-card cat-card-large'
                  data-cursor="product"
                >
                  <div
                    className='cat-card-image'
                    style={{ backgroundImage: `url('${getCategoryBanner(categories[0].name) || '/images/banners/men.jpg'}')` }}
                  ></div>
                  <div className='cat-card-overlay'></div>
                  <div className='cat-card-content'>
                    <span className='cat-card-name'>{categories[0].name}</span>
                    <span className='cat-card-cta'>EXPLORE <span className='arrow'>→</span></span>
                  </div>
                </Link>
              )}

              <div className='cat-card-stack'>
                {categories[1] && (
                  <Link
                    to={`/shop/category/${categories[1].slug}`}
                    className='cat-card cat-card-top'
                    data-cursor="product"
                  >
                    <div
                      className='cat-card-image'
                      style={{ backgroundImage: `url('${getCategoryBanner(categories[1].name) || '/images/banners/women.jpg'}')` }}
                    ></div>
                    <div className='cat-card-overlay'></div>
                    <div className='cat-card-content'>
                      <span className='cat-card-name'>{categories[1].name}</span>
                      <span className='cat-card-cta'>EXPLORE <span className='arrow'>→</span></span>
                    </div>
                  </Link>
                )}
                {categories[2] && (
                  <Link
                    to={`/shop/category/${categories[2].slug}`}
                    className='cat-card cat-card-bottom'
                    data-cursor="product"
                  >
                    <div
                      className='cat-card-image'
                      style={{ backgroundImage: `url('${getCategoryBanner(categories[2].name) || '/images/banners/kids.jpg'}')` }}
                    ></div>
                    <div className='cat-card-overlay'></div>
                    <div className='cat-card-content'>
                      <span className='cat-card-name'>{categories[2].name}</span>
                      <span className='cat-card-cta'>EXPLORE <span className='arrow'>→</span></span>
                    </div>
                  </Link>
                )}
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* SECTION 4: TRENDING NOW CAROUSEL */}
      {products && products.length > 0 && (
        <section className='section-trending py-5' data-animate="fade-up">
          <Container>
            <SectionHeader number="02" title="Trending Now" link="/shop" linkText="See All" />
            <div className="carousel-wrapper-custom">
              <CarouselSlider responsive={responsive} infinite={products && products.length > 3} autoPlay={true}>
                {products.slice(0, 6).map((product, idx) => (
                  <div key={product._id || idx} className="carousel-product-card px-2">
                    <ProductList
                      products={[product]}
                      authenticated={authenticated}
                      updateWishlist={updateWishlist}
                      handleAddToCart={handleAddToCart}
                    />
                  </div>
                ))}
              </CarouselSlider>
            </div>
          </Container>
        </section>
      )}

      {/* SECTION 5: EDITORIAL SPLIT */}
      <section className='section-editorial-split'>
        <div className='editorial-left' data-animate="slide-left">
          <span className='editorial-mono-tag'>— THE CARTZA STORY</span>
          <h2 className='editorial-headline'>
            Crafted for those who live with intention.
          </h2>
          <p className='editorial-body'>
            Every piece in our collection tells a story — of skilled artisans, premium materials, and the belief that what you wear is a reflection of who you are. We don&apos;t follow trends. We curate timelessness.
          </p>
          <Link to='/contact' className='btn-primary-dark' data-cursor="link">
            <span>DISCOVER MORE</span>
          </Link>
        </div>
        <div className='editorial-right' data-animate="slide-right">
          <div className='editorial-image' style={{ backgroundImage: "url('/images/banners/banner-2.jpg')" }}></div>
        </div>
      </section>

      {/* SECTION 6: NEW ARRIVALS GRID */}
      {products && products.length > 4 && (
        <section className='section-new-arrivals py-5' data-animate="fade-up">
          <Container>
            <SectionHeader number="03" title="New Arrivals" link="/shop" linkText="Shop New" />
            <ProductList
              products={products.slice(4, 8)}
              authenticated={authenticated}
              updateWishlist={updateWishlist}
              handleAddToCart={handleAddToCart}
            />
          </Container>
        </section>
      )}

      {/* SECTION 7: RECENTLY VIEWED (conditional) */}
      {recentlyViewed && recentlyViewed.length > 0 && (
        <section className='section-recently-viewed py-5' data-animate="fade-up">
          <Container>
            <SectionHeader number="04" title="Recently Viewed" />
            <ProductList
              products={recentlyViewed}
              authenticated={authenticated}
              updateWishlist={updateWishlist}
              handleAddToCart={handleAddToCart}
            />
          </Container>
        </section>
      )}

      {/* SECTION 8: NEWSLETTER TRANSITION */}
      <section className='section-newsletter-band' data-animate="fade-up">
        <Container>
          <div className='newsletter-editorial-row'>
            <h2 className='newsletter-headline-editorial'>Stay in the loop.</h2>
            <p className='newsletter-sub'>Be the first to know about new arrivals, exclusive offers, and editorial drops.</p>
            <form onSubmit={handleSubmit} noValidate>
              <div className='newsletter-input-editorial'>
                <input
                  type='email'
                  name='email'
                  placeholder='your@email.com'
                  className='newsletter-email-field'
                  data-cursor="text"
                  value={email}
                  onChange={e => dispatch(actions.newsletterChange('email', e.target.value))}
                  required
                />
                <button type='submit' className='newsletter-submit-btn' data-cursor="link">
                  <span>SUBSCRIBE</span> <ArrowRight size={14} strokeWidth={1.2} />
                </button>
              </div>
              {formErrors['email'] && (
                <p className='text-danger mt-2 font-weight-500' style={{ fontSize: '13px' }}>
                  {formErrors['email']}
                </p>
              )}
            </form>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default Homepage;
