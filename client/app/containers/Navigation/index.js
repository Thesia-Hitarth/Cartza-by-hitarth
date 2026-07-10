/**
 *
 * Navigation — CARTZA Premium Navbar
 *
 * Single fixed bar: transparent → frosted glass on scroll
 * Smart-hide: hides on fast scroll down, shows on scroll up
 *
 */

import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import Autosuggest from 'react-autosuggest';
import AutosuggestHighlightMatch from 'autosuggest-highlight/match';
import AutosuggestHighlightParse from 'autosuggest-highlight/parse';
import {
  Container,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from 'reactstrap';

import actions from '../../actions';
import CartIcon from '../../components/Common/CartIcon';
import { Heart, Search, User, X, Sun, Moon } from 'lucide-react/dist/cjs/lucide-react.cjs';
import Cart from '../Cart';
import AnnouncementBar from '../../components/Common/Navigation/AnnouncementBar';
import MobileMenu from '../../components/Common/Navigation/MobileMenu';
import { getCloudinaryUrl } from '../../utils/cloudinary';
import { getStorageItem, setStorageItem } from '../../utils/storage';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const isHome = location.pathname === '/';

  // Redux selectors
  const isMenuOpen = useSelector(state => state.navigation.isMenuOpen);
  const isCartOpen = useSelector(state => state.navigation.isCartOpen);
  const cartItems = useSelector(state => state.cart.cartItems);
  const categories = useSelector(state => state.category.storeCategories);
  const authenticated = useSelector(state => state.authentication.authenticated);
  const user = useSelector(state => state.account.user);
  const searchValue = useSelector(state => state.navigation.searchValue);
  const suggestions = useSelector(state => state.navigation.searchSuggestions);

  // Local state
  const [showAnnouncement, setShowAnnouncement] = useState(() => {
    const ANNOUNCEMENT_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
    const dismissedAt = typeof window !== 'undefined'
      ? Number(getStorageItem('cartza_announcement_dismissed_at') || 0)
      : 0;
    const announcementDismissed = dismissedAt > 0 && (Date.now() - dismissedAt) < ANNOUNCEMENT_TTL_MS;
    return !announcementDismissed;
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(!isHome);
  const [navHidden, setNavHidden] = useState(false);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth < 992 : false);
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return getStorageItem('theme') || 'light';
    }
    return 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark-theme');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark-theme');
    }
    setStorageItem('theme', theme);
  }, [theme]);

  const lastScrollY = useRef(0);
  const cartTrigger = useRef(null);
  const menuTrigger = useRef(null);

  // Initialize
  useEffect(() => {
    dispatch(actions.fetchStoreBrands());
    dispatch(actions.fetchStoreCategories());
  }, [dispatch]);

  // Scroll handler
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollY.current;

      const isScrolled = location.pathname !== '/' ? true : currentScrollY > 80;

      let nextNavHidden = navHidden;
      if (delta > 8 && currentScrollY > 200) {
        nextNavHidden = true;
      } else if (delta < -3) {
        nextNavHidden = false;
      }

      setScrolled(isScrolled);
      setNavHidden(nextNavHidden);
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Sync immediately
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname, navHidden]);

  // Resize handler
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 992);
    };

    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Route change scroll reset
  useEffect(() => {
    const nextScrolled = location.pathname !== '/' ? true : window.scrollY > 80;
    setScrolled(nextScrolled);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Focus trap accessibility
  useEffect(() => {
    const handleFocusTrap = (e) => {
      if (!isCartOpen && !isMenuOpen) return;
      if (e.key !== 'Tab') return;

      let container = null;
      if (isCartOpen) {
        container = document.querySelector('.mini-cart-open');
      } else if (isMenuOpen) {
        container = document.querySelector('.mobile-full-screen-menu');
      }
      if (!container) return;

      const focusables = container.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusables.length === 0) {
        e.preventDefault();
        return;
      }

      const firstElement = focusables[0];
      const lastElement = focusables[focusables.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    window.addEventListener('keydown', handleFocusTrap);
    return () => window.removeEventListener('keydown', handleFocusTrap);
  }, [isCartOpen, isMenuOpen]);

  // Handle body scroll locking on cart open
  useEffect(() => {
    if (isCartOpen) {
      document.body.classList.add('no-scroll');
      cartTrigger.current = document.activeElement;
      setTimeout(() => {
        const container = document.querySelector('.mini-cart-open');
        if (container) {
          const focusables = container.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])');
          if (focusables.length > 0) focusables[0].focus();
        }
      }, 50);
    } else {
      document.body.classList.remove('no-scroll');
      if (cartTrigger.current) {
        cartTrigger.current.focus();
      }
    }
  }, [isCartOpen]);

  // Handle mobile menu focus state
  useEffect(() => {
    if (isMenuOpen) {
      menuTrigger.current = document.activeElement;
      setTimeout(() => {
        const container = document.querySelector('.mobile-full-screen-menu');
        if (container) {
          const focusables = container.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])');
          if (focusables.length > 0) focusables[0].focus();
        }
      }, 50);
    } else {
      if (menuTrigger.current) {
        menuTrigger.current.focus();
      }
    }
  }, [isMenuOpen]);

  const dismissAnnouncement = () => {
    setShowAnnouncement(false);
    setStorageItem('cartza_announcement_dismissed_at', String(Date.now()));
  };

  const getSuggestionValue = (suggestion) => suggestion.name;

  const renderSuggestion = (suggestion, { query }) => {
    const BoldName = (item, q) => {
      const matches = AutosuggestHighlightMatch(item.name, q);
      const parts = AutosuggestHighlightParse(item.name, matches);

      return (
        <div>
          {parts.map((part, index) => {
            const className = part.highlight
              ? 'react-autosuggest__suggestion-match'
              : null;
            return (
              <span className={className} key={index}>
                {part.text}
              </span>
            );
          })}
        </div>
      );
    };

    return (
      <Link to={`/product/${suggestion.slug}`} className="search-suggestion-link">
        <div className='d-flex align-items-center suggestion-item'>
          <img
            className='item-image mr-3'
            src={getCloudinaryUrl(suggestion.imageUrl, 50)}
            alt={suggestion.name}
            loading="lazy"
            width={50}
            height={50}
          />
          <div className="suggestion-details">
            <span className='name'>{BoldName(suggestion, query)}</span>
            <span className='price d-block'>₹{suggestion.price}</span>
          </div>
        </div>
      </Link>
    );
  };

  const inputProps = {
    placeholder: 'Search Products...',
    value: searchValue,
    onChange: (_, { newValue }) => {
      dispatch(actions.onSearch(newValue));
    }
  };

  const headerClasses = [
    'header',
    'fixed-mobile-header',
    scrolled ? 'scrolled' : '',
    navHidden ? 'nav-hidden' : '',
  ].filter(Boolean).join(' ');

  return (
    <>
      <header className={headerClasses}>
        <AnnouncementBar show={showAnnouncement} onDismiss={dismissAnnouncement} />

        <div className='main-nav-wrapper'>
          <Container>
            <div className='main-nav-inner d-flex align-items-center justify-content-between'>
              {/* Left: Logo + Mobile Hamburger */}
              <div className='nav-left d-flex align-items-center'>
                <button
                  className={`mobile-hamburger d-lg-none ${isMenuOpen ? 'open' : ''}`}
                  onClick={() => {
                    dispatch(actions.fetchStoreCategories());
                    dispatch(actions.toggleMenu());
                  }}
                  aria-label='Toggle menu'
                >
                  <span className='hamburger-line'></span>
                  <span className='hamburger-line'></span>
                  <span className='hamburger-line'></span>
                </button>

                <Link to='/' className='brand-link' data-cursor="link">
                  <span className='logo-text'>CARTZA</span>
                </Link>
              </div>

              {/* Center: Category Nav Links (Desktop) */}
              <nav className='nav-links-center'>
                {categories && categories.slice(0, 3).map((cat, index) => (
                  <NavLink
                    key={index}
                    to={`/shop/category/${cat.slug}`}
                    className={({ isActive }) => `nav-link-item${isActive ? ' active' : ''}`}
                    data-cursor="link"
                  >
                    {cat.name}
                  </NavLink>
                ))}
                <NavLink
                  to='/brands'
                  className={({ isActive }) => `nav-link-item${isActive ? ' active' : ''}`}
                  data-cursor="link"
                >
                  Brands
                </NavLink>
              </nav>

              {/* Right Controls & Icons */}
              <div className='nav-right d-flex align-items-center'>
                <div className='nav-icon-row d-flex align-items-center'>
                  <button className='nav-icon-btn d-lg-none mobile-search-trigger' onClick={() => setIsMobileSearchOpen(prev => !prev)} aria-label='Search' data-cursor="link">
                    {isMobileSearchOpen ? <X size={18} strokeWidth={1.2} /> : <Search size={18} strokeWidth={1.2} />}
                  </button>

                  {/* Desktop Search */}
                  {!isMobile && (
                    <div className='d-none d-lg-block'>
                      <div className='search-input-wrapper' style={{ width: 260 }}>
                        <span className='search-icon-left'>
                          <Search size={16} strokeWidth={1.2} />
                        </span>
                        <Autosuggest
                          suggestions={suggestions}
                          onSuggestionsFetchRequested={(val) => dispatch(actions.onSuggestionsFetchRequested(val))}
                          onSuggestionsClearRequested={() => dispatch(actions.onSuggestionsClearRequested())}
                          getSuggestionValue={getSuggestionValue}
                          renderSuggestion={renderSuggestion}
                          inputProps={inputProps}
                          onSuggestionSelected={(_, item) => {
                            navigate(`/product/${item.suggestion.slug}`);
                          }}
                        />
                        {searchValue && (
                          <button className='search-clear-btn' onClick={() => dispatch(actions.onSearch(''))} aria-label='Clear search'>
                            <X size={14} strokeWidth={1.2} />
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Wishlist Icon */}
                  <Link to='/wishlist' className='nav-icon-link d-none d-md-flex' aria-label='Wishlist' data-cursor="link">
                    <Heart size={18} strokeWidth={1.2} />
                  </Link>

                  {/* Theme Toggle Button */}
                  <button 
                    onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')} 
                    className='nav-icon-btn d-flex align-items-center'
                    aria-label='Toggle Dark Mode'
                    type='button'
                    style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
                  >
                    {theme === 'light' ? <Moon size={18} strokeWidth={1.2} /> : <Sun size={18} strokeWidth={1.2} />}
                  </button>

                  {/* Account / User Menu Dropdown */}
                  <Dropdown isOpen={isDropdownOpen} toggle={() => setIsDropdownOpen(prev => !prev)} className='account-dropdown-nav'>
                    <DropdownToggle className='nav-icon-btn d-flex align-items-center' tag="button" aria-label='Account menu' data-cursor="link">
                      <User size={18} strokeWidth={1.2} />
                    </DropdownToggle>
                    <DropdownMenu right>
                      {authenticated ? (
                        <>
                          <div className='dropdown-user-greeting px-3 py-2'>
                            <strong>Hello, {user.firstName || 'User'}</strong>
                          </div>
                          <DropdownItem divider />
                          <DropdownItem onClick={() => navigate('/dashboard')}>Dashboard</DropdownItem>
                          <DropdownItem onClick={() => dispatch(actions.signOut())}>Sign Out</DropdownItem>
                        </>
                      ) : (
                        <>
                          <DropdownItem onClick={() => navigate('/login')}>Login</DropdownItem>
                          <DropdownItem onClick={() => navigate('/register')}>Sign Up</DropdownItem>
                        </>
                      )}
                    </DropdownMenu>
                  </Dropdown>

                  {/* Cart Icon */}
                  <CartIcon cartItems={cartItems} onClick={() => dispatch(actions.toggleCart())} className='nav-cart-icon-btn' />
                </div>
              </div>
            </div>

            {/* Mobile-only Search Bar */}
            {isMobile && isMobileSearchOpen && (
              <div className='mobile-search-bar d-lg-none py-2'>
                <div className='search-input-wrapper'>
                  <span className='search-icon-left'>
                    <Search size={16} strokeWidth={1.2} />
                  </span>
                  <Autosuggest
                    suggestions={suggestions}
                    onSuggestionsFetchRequested={(val) => dispatch(actions.onSuggestionsFetchRequested(val))}
                    onSuggestionsClearRequested={() => dispatch(actions.onSuggestionsClearRequested())}
                    getSuggestionValue={getSuggestionValue}
                    renderSuggestion={renderSuggestion}
                    inputProps={{ ...inputProps, placeholder: 'Search...' }}
                    onSuggestionSelected={(_, item) => {
                      navigate(`/product/${item.suggestion.slug}`);
                    }}
                  />
                </div>
              </div>
            )}
          </Container>
        </div>
      </header>

      {/* hidden cart drawer */}
      <div
        className={isCartOpen ? 'mini-cart-open' : 'hidden-mini-cart'}
        aria-hidden={!isCartOpen}
      >
        <div className='mini-cart'>
          <Cart />
        </div>
        <div
          className={isCartOpen ? 'drawer-backdrop dark-overflow' : 'drawer-backdrop'}
          onClick={() => dispatch(actions.toggleCart())}
        />
      </div>

      {/* Full-screen Overlay Menu for Mobile */}
      <MobileMenu
        isOpen={isMenuOpen}
        onClose={() => {
          dispatch(actions.fetchStoreCategories());
          dispatch(actions.toggleMenu());
        }}
      />
    </>
  );
};

export default Navigation;
