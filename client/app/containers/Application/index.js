/**
 *
 * Application
 *
 */

import React from 'react';

import { connect } from 'react-redux';
import { Routes, Route } from 'react-router-dom';
import { withRouter } from '../../utils/withRouter';
import { Container } from 'reactstrap';
import { motion, AnimatePresence } from 'framer-motion';

import actions from '../../actions';

// routes
import Login from '../Login';
import Signup from '../Signup';
import MerchantSignup from '../MerchantSignup';
import HomePage from '../Homepage';
import Dashboard from '../Dashboard';
import Navigation from '../Navigation';
import Authentication from '../Authentication';
import Notification from '../Notification';
import ForgotPassword from '../ForgotPassword';
import ResetPassword from '../ResetPassword';
import Shop from '../Shop';
import BrandsPage from '../BrandsPage';
import ProductPage from '../ProductPage';
import Sell from '../Sell';
import Contact from '../Contact';
import OrderSuccess from '../OrderSuccess';
import OrderPage from '../OrderPage';
import AuthSuccess from '../AuthSuccess';

import Footer from '../../components/Common/Footer';
import Page404 from '../../components/Common/Page404';
import { CART_ITEMS } from '../../constants';

const AuthenticatedDashboard = Authentication(Dashboard);

class Application extends React.PureComponent {
  constructor(props) {
    super(props);
    this.handleStorage = this.handleStorage.bind(this);
  }
  componentDidMount() {
    const token = localStorage.getItem('token');

    if (token) {
      this.props.fetchProfile();
    }

    this.props.handleCart();

    document.addEventListener('keydown', this.handleTabbing);
    document.addEventListener('mousedown', this.handleMouseDown);
    window.addEventListener('storage', this.handleStorage);

    // Scroll trigger animations using IntersectionObserver
    if ('IntersectionObserver' in window) {
      const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
      };

      const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      }, observerOptions);

      // Initial elements
      const animatedElements = document.querySelectorAll('[data-animate]');
      animatedElements.forEach(el => observer.observe(el));

      // Mutation observer to detect dynamically added components (e.g., product lists, categories)
      this.mutationObserver = new MutationObserver(() => {
        const newAnimatedElements = document.querySelectorAll('[data-animate]:not(.is-visible)');
        newAnimatedElements.forEach(el => observer.observe(el));
      });
      this.mutationObserver.observe(document.body, { childList: true, subtree: true });
    } else {
      // Fallback
      const animatedElements = document.querySelectorAll('[data-animate]');
      animatedElements.forEach(el => el.classList.add('is-visible'));
    }
  }

  componentWillUnmount() {
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
    }
    document.removeEventListener('keydown', this.handleTabbing);
    document.removeEventListener('mousedown', this.handleMouseDown);
    window.removeEventListener('storage', this.handleStorage);
  }

  handleStorage(e) {
    if (e.key === CART_ITEMS) {
      this.props.handleCart();
    }
  }

  handleTabbing(e) {
    if (e.keyCode === 9) {
      document.body.classList.add('user-is-tabbing');
    }
  }

  handleMouseDown() {
    document.body.classList.remove('user-is-tabbing');
  }

  render() {
    const { location } = this.props;

    const pageVariants = {
      initial: { opacity: 0, y: 8 },
      enter: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] } },
      exit: { opacity: 0, transition: { duration: 0.15 } }
    };

    return (
      <div className='application'>
        <Notification />
        <Navigation />
        <main className='main'>
          <Container>
            <div className='wrapper'>
              <AnimatePresence exitBeforeEnter>
                <motion.div
                  key={location.pathname}
                  variants={pageVariants}
                  initial="initial"
                  animate="enter"
                  exit="exit"
                >
                  <Routes>
                    <Route path='/' element={<HomePage />} />
                    <Route path='/shop/*' element={<Shop />} />
                    <Route path='/sell' element={<Sell />} />
                    <Route path='/contact' element={<Contact />} />
                    <Route path='/brands' element={<BrandsPage />} />
                    <Route path='/product/:slug' element={<ProductPage />} />
                    <Route path='/order/success/:id' element={<OrderSuccess />} />
                    <Route path='/order/:id' element={<OrderPage />} />
                    <Route path='/login' element={<Login />} />
                    <Route path='/register' element={<Signup />} />
                    <Route
                      path='/merchant-signup/:token'
                      element={<MerchantSignup />}
                    />
                    <Route path='/forgot-password' element={<ForgotPassword />} />
                    <Route
                      path='/reset-password/:token'
                      element={<ResetPassword />}
                    />
                    <Route path='/auth/success' element={<AuthSuccess />} />
                    <Route
                      path='/dashboard/*'
                      element={<AuthenticatedDashboard />}
                    />
                    <Route path='/404' element={<Page404 />} />
                    <Route path='*' element={<Page404 />} />
                  </Routes>
                </motion.div>
              </AnimatePresence>
            </div>
          </Container>
        </main>
        <Footer />
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    authenticated: state.authentication.authenticated,
    products: state.product.storeProducts
  };
};

export default withRouter(connect(mapStateToProps, actions)(Application));
