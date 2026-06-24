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

import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Container } from 'reactstrap';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react/dist/cjs/lucide-react.cjs';

import actions from '../../actions';
import { withRouter } from '../../utils/withRouter';
import Marquee from '../../components/ui/Marquee';
import SectionHeader from '../../components/ui/SectionHeader';

const getCategoryBanner = (name = '') => {
  const categoryName = (name || '').toLowerCase();
  if (categoryName.includes('fashion') || categoryName.includes('cloth') || categoryName.includes('wear') || categoryName.includes('apparel')) {
    return '/images/banners/banner-1.png';
  }
  if (categoryName.includes('electron') || categoryName.includes('tech') || categoryName.includes('phone') || categoryName.includes('gadget')) {
    return '/images/banners/banner-3.png';
  }
  if (categoryName.includes('home') || categoryName.includes('garden') || categoryName.includes('furnit') || categoryName.includes('kitchen') || categoryName.includes('living')) {
    return '/images/banners/banner-4.jpg';
  }
  if (categoryName.includes('sport') || categoryName.includes('outdoor') || categoryName.includes('fitness')) {
    return '/images/banners/banner-2.png';
  }
  if (categoryName.includes('beauty') || categoryName.includes('cosmetic') || categoryName.includes('makeup')) {
    return '/images/banners/banner-7.jpg';
  }
  if (categoryName.includes('bag') || categoryName.includes('shoe') || categoryName.includes('accessor')) {
    return '/images/banners/banner-5.jpg';
  }
  return null;
};

const defaultImages = [
  '/images/banners/banner-1.png',
  '/images/banners/banner-2.png',
  '/images/banners/banner-3.png',
  '/images/banners/banner-4.jpg',
  '/images/banners/banner-5.jpg',
  '/images/banners/banner-6.jpg',
  '/images/banners/banner-7.jpg'
];

// Animation variants
const heroTextVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: 0.3 + i * 0.2, ease: [0.16, 1, 0.3, 1] }
  })
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.5 }
  }
};

const fadeUpItem = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
};

class Homepage extends React.PureComponent {
  componentDidMount() {
    this.props.fetchStoreCategories();
  }

  render() {
    const {
      categories,
      history,
      email,
      formErrors,
      newsletterChange,
      subscribeToNewsletter
    } = this.props;

    const handleSubmit = event => {
      event.preventDefault();
      subscribeToNewsletter();
    };

    return (
      <div className='homepage-redesign'>
        {/* ═══════════════════════════════════════════
            SECTION 1: HERO — Full viewport Ken Burns
            ═══════════════════════════════════════════ */}
        <section className='hero-section'>
          {/* Background image with Ken Burns */}
          <div className='hero-bg-image' style={{ backgroundImage: "url('/images/banners/banner-1.png')" }}></div>
          <div className='hero-overlay'></div>

          {/* Content layer */}
          <div className='hero-content-layer'>
            <Container>
              <motion.div
                className='hero-content-inner'
                initial="hidden"
                animate="visible"
              >
                {/* Mono tag */}
                <motion.span className='hero-mono-tag' custom={0} variants={heroTextVariants}>
                  — NEW COLLECTION SS'26
                </motion.span>

                {/* Headline */}
                <motion.h1 className='hero-headline' custom={1} variants={heroTextVariants}>
                  <span className='hero-line-italic'>Style Is</span>
                  <span className='hero-line-roman'>Not Loud.</span>
                </motion.h1>

                {/* Sub-copy */}
                <motion.p className='hero-subcopy' custom={2} variants={heroTextVariants}>
                  Discover the season's most refined pieces — curated fashion, electronics & lifestyle for those who live with intention.
                </motion.p>

                {/* CTA Row */}
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

        {/* ═══════════════════════════════════════════
            SECTION 2: MARQUEE STRIP
            ═══════════════════════════════════════════ */}
        <Marquee speed={28} bg="accent" textColor="white">
          FREE DELIVERY ON ₹999+  ✦  NEW ARRIVALS EVERY MONDAY  ✦  30-DAY RETURNS  ✦  4.9★ RATED  ✦  FREE DELIVERY ON ₹999+  ✦  NEW ARRIVALS EVERY MONDAY  ✦  30-DAY RETURNS  ✦  4.9★ RATED  ✦
        </Marquee>

        {/* ═══════════════════════════════════════════
            SECTION 3: CATEGORY EDITORIAL GRID
            ═══════════════════════════════════════════ */}
        {categories && categories.length > 0 && (
          <section className='section-categories' data-animate="fade-up">
            <Container>
              <SectionHeader number="01" title="Shop by Category" link="/shop" linkText="View All" />

              <div className='category-editorial-grid'>
                {/* Large card (left 2/3) */}
                {categories[0] && (
                  <div
                    className='cat-card cat-card-large'
                    onClick={() => history.push(`/shop/category/${categories[0].slug}`)}
                    data-cursor="product"
                  >
                    <div
                      className='cat-card-image'
                      style={{ backgroundImage: `url('${getCategoryBanner(categories[0].name) || defaultImages[0]}')` }}
                    ></div>
                    <div className='cat-card-overlay'></div>
                    <div className='cat-card-content'>
                      <span className='cat-card-name'>{categories[0].name}</span>
                      <span className='cat-card-cta'>EXPLORE <span className='arrow'>→</span></span>
                    </div>
                  </div>
                )}

                {/* Right stacked cards (1/3) */}
                <div className='cat-card-stack'>
                  {categories[1] && (
                    <div
                      className='cat-card cat-card-top'
                      onClick={() => history.push(`/shop/category/${categories[1].slug}`)}
                      data-cursor="product"
                    >
                      <div
                        className='cat-card-image'
                        style={{ backgroundImage: `url('${getCategoryBanner(categories[1].name) || defaultImages[1]}')` }}
                      ></div>
                      <div className='cat-card-overlay'></div>
                      <div className='cat-card-content'>
                        <span className='cat-card-name'>{categories[1].name}</span>
                        <span className='cat-card-cta'>EXPLORE <span className='arrow'>→</span></span>
                      </div>
                    </div>
                  )}
                  {categories[2] && (
                    <div
                      className='cat-card cat-card-bottom'
                      onClick={() => history.push(`/shop/category/${categories[2].slug}`)}
                      data-cursor="product"
                    >
                      <div
                        className='cat-card-image'
                        style={{ backgroundImage: `url('${getCategoryBanner(categories[2].name) || defaultImages[2]}')` }}
                      ></div>
                      <div className='cat-card-overlay'></div>
                      <div className='cat-card-content'>
                        <span className='cat-card-name'>{categories[2].name}</span>
                        <span className='cat-card-cta'>EXPLORE <span className='arrow'>→</span></span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional categories as smaller row */}
              {categories.length > 3 && (
                <div className='category-row-extra'>
                  {categories.slice(3).map((category, index) => (
                    <div
                      key={category._id}
                      className='cat-card cat-card-small'
                      onClick={() => history.push(`/shop/category/${category.slug}`)}
                      data-cursor="product"
                    >
                      <div
                        className='cat-card-image'
                        style={{ backgroundImage: `url('${getCategoryBanner(category.name) || defaultImages[(index + 3) % defaultImages.length]}')` }}
                      ></div>
                      <div className='cat-card-overlay'></div>
                      <div className='cat-card-content'>
                        <span className='cat-card-name'>{category.name}</span>
                        <span className='cat-card-cta'>EXPLORE <span className='arrow'>→</span></span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Container>
          </section>
        )}

        {/* ═══════════════════════════════════════════
            SECTION 5: EDITORIAL SPLIT — "THE STORY"
            ═══════════════════════════════════════════ */}
        <section className='section-editorial-split'>
          <div className='editorial-left' data-animate="slide-left">
            <span className='editorial-mono-tag'>— THE CARTZA STORY</span>
            <h2 className='editorial-headline'>
              Crafted for those who live with intention.
            </h2>
            <p className='editorial-body'>
              Every piece in our collection tells a story — of skilled artisans, premium materials, and the belief that what you wear is a reflection of who you are. We don't follow trends. We curate timelessness.
            </p>
            <Link to='/contact' className='btn-primary-dark' data-cursor="link">
              <span>DISCOVER MORE</span>
            </Link>
          </div>
          <div className='editorial-right' data-animate="slide-right">
            <div className='editorial-image' style={{ backgroundImage: "url('/images/banners/banner-2.png')" }}></div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            SECTION 8: NEWSLETTER TRANSITION
            ═══════════════════════════════════════════ */}
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
                    onChange={e => newsletterChange('email', e.target.value)}
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
  }
}

const mapStateToProps = state => {
  return {
    categories: state.category.storeCategories,
    email: state.newsletter.email,
    formErrors: state.newsletter.formErrors
  };
};

export default withRouter(connect(mapStateToProps, actions)(Homepage));
