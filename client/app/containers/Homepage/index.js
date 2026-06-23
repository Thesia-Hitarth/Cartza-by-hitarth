/**
 *
 * Homepage
 *
 */

import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Row, Col, Container } from 'reactstrap';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react/dist/cjs/lucide-react.cjs';

import actions from '../../actions';
import { withRouter } from '../../utils/withRouter';

const getCategoryBanner = (name = '') => {
  const categoryName = (name || '').toLowerCase();
  if (categoryName.includes('fashion') || categoryName.includes('cloth') || categoryName.includes('wear') || categoryName.includes('apparel')) {
    return '/images/banners/banner-1.jpg';
  }
  if (categoryName.includes('electron') || categoryName.includes('tech') || categoryName.includes('phone') || categoryName.includes('gadget')) {
    return '/images/banners/banner-3.jpg';
  }
  if (categoryName.includes('home') || categoryName.includes('garden') || categoryName.includes('furnit') || categoryName.includes('kitchen') || categoryName.includes('living')) {
    return '/images/banners/banner-4.jpg';
  }
  if (categoryName.includes('sport') || categoryName.includes('outdoor') || categoryName.includes('fitness')) {
    return '/images/banners/banner-2.jpg';
  }
  if (categoryName.includes('beauty') || categoryName.includes('cosmetic') || categoryName.includes('makeup')) {
    return '/images/banners/banner-7.jpg';
  }
  if (categoryName.includes('bag') || categoryName.includes('shoe') || categoryName.includes('accessor')) {
    return '/images/banners/banner-5.jpg';
  }
  return null;
};

const getSeason = () => {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return 'SPRING';
  if (month >= 5 && month <= 7) return 'SUMMER';
  if (month >= 8 && month <= 10) return 'AUTUMN';
  return 'WINTER';
};

const brandContainerVariants = {
  animate: {
    transition: {
      staggerChildren: 0.08
    }
  }
};

const brandLetterVariants = {
  initial: { y: '100%', opacity: 0 },
  animate: { y: 0, opacity: 1, transition: { duration: 0.6, ease: [0.25, 1, 0.5, 1] } }
};

const wordContainerVariants = {
  animate: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3
    }
  }
};

const wordVariants = {
  initial: { y: 20, opacity: 0 },
  animate: { y: 0, opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } }
};

class Homepage extends React.PureComponent {
  componentDidMount() {
    this.props.fetchStoreCategories();
  }

  render() {
    const { categories, history } = this.props;

    const defaultImages = [
      '/images/banners/banner-1.jpg',
      '/images/banners/banner-2.jpg',
      '/images/banners/banner-3.jpg',
      '/images/banners/banner-4.jpg',
      '/images/banners/banner-5.jpg',
      '/images/banners/banner-6.jpg',
      '/images/banners/banner-7.jpg'
    ];

    return (
      <div className='homepage-redesign'>
        {/* Section 1: Full-viewport Hero */}
        <section className='hero-section' data-animate="fade-up">
          <Container className="h-100">
            <Row className='align-items-center h-100'>
              {/* Left Column: Headline and Content */}
              <Col xs='12' lg='7' className='hero-left-content pr-lg-5'>
                <div className='hero-eyebrow'>
                  {`NEW ARRIVALS · ${getSeason()} ${new Date().getFullYear()}`}
                </div>

                <h1 className='hero-headline'>
                  <motion.div
                    className='kinetic-brand tw-flex'
                    variants={brandContainerVariants}
                    initial="initial"
                    animate="animate"
                  >
                    {"CARTZA".split("").map((letter, idx) => (
                      <motion.span
                        key={idx}
                        className='kinetic-char tw-inline-block'
                        variants={brandLetterVariants}
                      >
                        {letter}
                      </motion.span>
                    ))}
                  </motion.div>
                  <motion.div
                    className='headline-lines'
                    variants={wordContainerVariants}
                    initial="initial"
                    animate="animate"
                  >
                    <motion.span className='headline-word tw-block' variants={wordVariants}>Discover</motion.span>
                    <motion.span className='headline-word tw-block' variants={wordVariants}>Style That</motion.span>
                    <motion.span className='headline-word tw-block' variants={wordVariants}>Speaks.</motion.span>
                  </motion.div>
                </h1>

                <p className='hero-subtext'>
                  Shop from 1,000+ curated products across fashion, electronics, home & more. Experiencing luxury, tailored for you.
                </p>

                <div className='hero-actions d-flex flex-column flex-sm-row align-items-sm-center'>
                  <Link to='/shop' className='btn-primary-custom text-center mb-3 mb-sm-0 mr-sm-4'>
                    Shop Now
                  </Link>
                  <Link to='/brands' className='btn-secondary-custom text-center'>
                    Explore Brands
                  </Link>
                </div>

                {/* Trust Row */}
                <div className='hero-trust-row d-flex align-items-center flex-wrap'>
                  <div className='trust-pill d-flex align-items-center'>
                    <Check size={14} strokeWidth={3} className="mr-2 text-success" />
                    <span>Free Returns</span>
                  </div>
                  <div className='trust-pill d-flex align-items-center'>
                    <Check size={14} strokeWidth={3} className="mr-2 text-success" />
                    <span>Secure Payment</span>
                  </div>
                  <div className='trust-pill d-flex align-items-center'>
                    <Check size={14} strokeWidth={3} className="mr-2 text-success" />
                    <span>10-day Guarantee</span>
                  </div>
                </div>
              </Col>

              {/* Right Column: Overlapping Image Mosaic */}
              <Col xs='12' lg='5' className='hero-right-content mt-5 mt-lg-0 position-relative'>
                <div className='hero-mosaic-container'>
                  {/* Ambient background glow */}
                  <div className='hero-ambient-glow'></div>

                  {/* Overlapping images */}
                  <div className='mosaic-item larger portrait shadow-lg' style={{ backgroundImage: "url('/images/banners/banner-1.jpg')" }}>
                  </div>

                  <div className='mosaic-item smaller square shadow-lg' style={{ backgroundImage: "url('/images/banners/banner-2.jpg')" }}></div>
                </div>
              </Col>
            </Row>
          </Container>
        </section>

        {/* Section 2: Category Strip */}
        {categories && categories.length > 0 && (
          <section className='categories-strip-section py-5' data-animate="fade-up">
            <Container>
              <div className='section-header mb-4 text-center text-md-left'>
                <h2 className='section-title'>Shop by Category</h2>
                <div className='section-title-line'></div>
              </div>

              <div className='category-cards-scroll-container'>
                {categories.map((category, index) => (
                  <motion.div
                    key={category._id}
                    className='category-scroll-card'
                    onClick={() => history.push(`/shop/category/${category.slug}`)}
                    whileHover={{ y: -6, scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <div className='category-card-image-box'>
                      <div
                        className='category-card-image'
                        style={{ backgroundImage: `url('${getCategoryBanner(category.name) || defaultImages[index % defaultImages.length]}')` }}
                      ></div>
                    </div>
                    <div className='category-card-body text-center p-3'>
                      <span className='category-card-name'>{category.name}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Container>
          </section>
        )}
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    categories: state.category.storeCategories
  };
};

export default withRouter(connect(mapStateToProps, actions)(Homepage));
