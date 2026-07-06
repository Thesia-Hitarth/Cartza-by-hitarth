/**
 *
 * Application
 *
 */

import React from 'react';

import { connect } from 'react-redux';
import { Routes, Route, useLocation } from 'react-router-dom';
import { withRouter } from '../../utils/withRouter';
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
import VerifyEmail from '../VerifyEmail';

import Footer from '../../components/Common/Footer';
import Page404 from '../../components/Common/Page404';
import CustomCursor from '../../components/ui/CustomCursor';
import { CART_ITEMS } from '../../constants';

import WishList from '../WishList';

const AuthenticatedDashboard = Authentication(Dashboard);
const AuthenticatedWishList = Authentication(WishList);
const AuthenticatedOrderPage = Authentication(OrderPage);

// Wrapper that provides padding-top for pages that need it (non-homepage)
const PageWrapper = ({ children, isFullBleed }) => {
  if (isFullBleed) return <>{children}</>;
  return <div className='wrapper'>{children}</div>;
};

class Application extends React.PureComponent {
  constructor(props) {
    super(props);
    this.handleStorage = this.handleStorage.bind(this);
  }

  async componentDidMount() {
    const loggedIn = localStorage.getItem('logged_in') === 'true';
    if (loggedIn) {
      try {
        await this.props.fetchProfile();
      } catch (e) {
        console.error(e);
      }
    }

    this.props.handleCart();

    document.addEventListener('keydown', this.handleTabbing);
    document.addEventListener('mousedown', this.handleMouseDown);
    window.addEventListener('storage', this.handleStorage);

    // Scroll-trigger animations via IntersectionObserver
    if ('IntersectionObserver' in window) {
      const observerOptions = {
        root: null,
        rootMargin: '0px 0px -80px 0px',
        threshold: 0.08
      };

      const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      }, observerOptions);

      document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));

      this.mutationObserver = new MutationObserver((mutations) => {
        let hasAddedNodes = false;
        for (const mutation of mutations) {
          if (mutation.addedNodes.length > 0) {
            hasAddedNodes = true;
            break;
          }
        }
        if (hasAddedNodes) {
          document.querySelectorAll('[data-animate]:not(.is-visible)').forEach(el => observer.observe(el));
        }
      });
      this.mutationObserver.observe(document.body, { childList: true, subtree: true });
    } else {
      document.querySelectorAll('[data-animate]').forEach(el => el.classList.add('is-visible'));
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
    const isHomePage = location.pathname === '/';

    const pageVariants = {
      initial: { opacity: 0 },
      enter: {
        opacity: 1,
        transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
      },
      exit: {
        opacity: 0,
        transition: { duration: 0.15 }
      }
    };

    return (
      <div className='application'>
        {/* Custom editorial cursor */}
        <CustomCursor />

        <Notification />
        <Navigation />

        <main className='main'>
          <AnimatePresence exitBeforeEnter mode="wait">
            <motion.div
              key={location.pathname}
              variants={pageVariants}
              initial="initial"
              animate="enter"
              exit="exit"
            >
              {/* All routes live together; homepage gets no wrapper padding */}
              <Routes>
                <Route
                  path='/'
                  element={<HomePage />}
                />
                <Route
                  path='/shop/*'
                  element={<div className='wrapper'><Shop /></div>}
                />
                <Route
                  path='/sell'
                  element={<div className='wrapper'><Sell /></div>}
                />
                <Route
                  path='/contact'
                  element={<div className='wrapper'><Contact /></div>}
                />
                <Route
                  path='/brands'
                  element={<div className='wrapper'><BrandsPage /></div>}
                />
                <Route
                  path='/product/:slug'
                  element={<div className='wrapper'><ProductPage /></div>}
                />
                <Route
                  path='/order/success/:id'
                  element={<div className='wrapper'><OrderSuccess /></div>}
                />
                <Route
                  path='/order/:id'
                  element={<div className='wrapper'><AuthenticatedOrderPage /></div>}
                />
                <Route
                  path='/login'
                  element={<div className='wrapper'><Login /></div>}
                />
                <Route
                  path='/register'
                  element={<div className='wrapper'><Signup /></div>}
                />
                <Route
                  path='/merchant-signup/:token'
                  element={<div className='wrapper'><MerchantSignup /></div>}
                />
                <Route
                  path='/forgot-password'
                  element={<div className='wrapper'><ForgotPassword /></div>}
                />
                <Route
                  path='/reset-password/:token'
                  element={<div className='wrapper'><ResetPassword /></div>}
                />
                <Route
                  path='/auth/success'
                  element={<div className='wrapper'><AuthSuccess /></div>}
                />
                <Route
                  path='/verify-email/:token'
                  element={<div className='wrapper'><VerifyEmail /></div>}
                />
                 <Route
                  path='/wishlist'
                  element={<div className='wrapper'><AuthenticatedWishList /></div>}
                />
                <Route
                  path='/dashboard/*'
                  element={<div className='wrapper'><AuthenticatedDashboard /></div>}
                />
                <Route
                  path='/404'
                  element={<div className='wrapper'><Page404 /></div>}
                />
                <Route
                  path='*'
                  element={<div className='wrapper'><Page404 /></div>}
                />
              </Routes>
            </motion.div>
          </AnimatePresence>
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
