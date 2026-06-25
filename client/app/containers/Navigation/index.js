/**
 *
 * Navigation — CARTZA Premium Navbar
 *
 * Single fixed bar: transparent → frosted glass on scroll
 * Smart-hide: hides on fast scroll down, shows on scroll up
 *
 */

import React from 'react';
import { connect } from 'react-redux';
import { Link, NavLink } from 'react-router-dom';
import { withRouter } from '../../utils/withRouter';
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
import { Heart, Search, User, X, ShoppingBag } from 'lucide-react/dist/cjs/lucide-react.cjs';
import Menu from '../NavigationMenu';
import Cart from '../Cart';

class Navigation extends React.PureComponent {
  isHomePage() {
    return this.props.location && this.props.location.pathname === '/';
  }
  constructor(props) {
    super(props);
    // Non-homepage pages start in 'scrolled' (frosted glass, dark text) state immediately
    const isHome = typeof window !== 'undefined'
      ? window.location.pathname === '/'
      : true;
    this.state = {
      showAnnouncement: localStorage.getItem('cartza_announcement_dismissed') !== 'true',
      isDropdownOpen: false,
      isMobileSearchOpen: false,
      scrolled: !isHome,
      navHidden: false,
    };
    this.lastScrollY = 0;
    this.dismissAnnouncement = this.dismissAnnouncement.bind(this);
    this.toggleDropdown = this.toggleDropdown.bind(this);
    this.toggleMobileSearch = this.toggleMobileSearch.bind(this);
    this.handleScroll = this.handleScroll.bind(this);
  }

  componentDidMount() {
    this.props.fetchStoreBrands();
    this.props.fetchStoreCategories();
    window.addEventListener('scroll', this.handleScroll, { passive: true });
    // Immediately sync scroll state (handles direct URL navigation)
    this.handleScroll();
  }

  componentDidUpdate(prevProps) {
    // When route changes, re-evaluate scrolled state for new page
    if (prevProps.location && this.props.location &&
        prevProps.location.pathname !== this.props.location.pathname) {
      const isHome = this.props.location.pathname === '/';
      this.setState({ scrolled: !isHome ? true : window.scrollY > 80 });
      window.scrollTo(0, 0);
    }

    if (this.props.isCartOpen !== prevProps.isCartOpen) {
      if (this.props.isCartOpen) {
        document.body.classList.add('no-scroll');
      } else {
        document.body.classList.remove('no-scroll');
      }
    }
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
    document.body.classList.remove('no-scroll');
  }

  handleScroll() {
    const currentScrollY = window.scrollY;
    const delta = currentScrollY - this.lastScrollY;

    // On non-homepage pages always stay in scrolled (frosted glass) state
    const scrolled = !this.isHomePage() ? true : currentScrollY > 80;

    // Smart-hide: hide on fast scroll down (delta > 8), show on scroll up
    let navHidden = this.state.navHidden;
    if (delta > 8 && currentScrollY > 200) {
      navHidden = true;
    } else if (delta < -3) {
      navHidden = false;
    }

    if (scrolled !== this.state.scrolled || navHidden !== this.state.navHidden) {
      this.setState({ scrolled, navHidden });
    }

    this.lastScrollY = currentScrollY;
  }

  dismissAnnouncement() {
    this.setState({ showAnnouncement: false });
    localStorage.setItem('cartza_announcement_dismissed', 'true');
  }

  toggleDropdown() {
    this.setState(prevState => ({
      isDropdownOpen: !prevState.isDropdownOpen
    }));
  }

  toggleMobileSearch() {
    this.setState(prev => ({ isMobileSearchOpen: !prev.isMobileSearchOpen }));
  }

  toggleBrand() {
    this.props.fetchStoreBrands();
    this.props.toggleBrand();
  }

  toggleMenu() {
    this.props.fetchStoreCategories();
    this.props.toggleMenu();
  }

  getSuggestionValue(suggestion) {
    return suggestion.name;
  }

  renderSuggestion(suggestion, { query }) {
    const BoldName = (suggestion, query) => {
      const matches = AutosuggestHighlightMatch(suggestion.name, query);
      const parts = AutosuggestHighlightParse(suggestion.name, matches);

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
            src={`${suggestion.imageUrl ? suggestion.imageUrl : '/images/placeholder-image.png'}`}
            alt={suggestion.name}
          />
          <div className="suggestion-details">
            <span className='name'>{BoldName(suggestion, query)}</span>
            <span className='price d-block'>₹{suggestion.price}</span>
          </div>
        </div>
      </Link>
    );
  }

  render() {
    const {
      history,
      authenticated,
      user,
      cartItems,
      brands,
      categories,
      signOut,
      isMenuOpen,
      isCartOpen,
      isBrandOpen,
      toggleCart,
      toggleMenu,
      searchValue,
      suggestions,
      onSearch,
      onSuggestionsFetchRequested,
      onSuggestionsClearRequested
    } = this.props;

    const { scrolled, navHidden } = this.state;

    const inputProps = {
      placeholder: 'Search Products...',
      value: searchValue,
      onChange: (_, { newValue }) => {
        onSearch(newValue);
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
        {/* Tier 1: Announcement Bar (gold accent) */}
        {this.state.showAnnouncement && (
          <div className='announcement-bar'>
            <div className='announcement-ticker'>
              <span>Free Delivery on Orders Above ₹999  ✦  Use Code CARTZA10 for 10% Off  ✦  New Arrivals Every Monday</span>
            </div>
            <button className='announcement-close' onClick={this.dismissAnnouncement} aria-label='Dismiss announcement'>
              <X size={14} strokeWidth={1.2} />
            </button>
          </div>
        )}

        {/* Tier 2: Main Nav */}
        <div className='main-nav-wrapper'>
          <Container>
            <div className='main-nav-inner d-flex align-items-center justify-content-between'>
              {/* Left: Logo + Mobile Hamburger */}
              <div className='nav-left d-flex align-items-center'>
                {/* Mobile Hamburger menu */}
                <button
                  className={`mobile-hamburger d-lg-none ${isMenuOpen ? 'open' : ''}`}
                  onClick={() => this.toggleMenu()}
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
                  {/* Search Icon for Mobile */}
                  <button className='nav-icon-btn d-lg-none mobile-search-trigger' onClick={() => this.toggleMobileSearch()} aria-label='Search' data-cursor="link">
                    {this.state.isMobileSearchOpen ? <X size={18} strokeWidth={1.2} /> : <Search size={18} strokeWidth={1.2} />}
                  </button>

                  {/* Desktop Search */}
                  <div className='d-none d-lg-block'>
                    <div className='search-input-wrapper' style={{ width: 260 }}>
                      <span className='search-icon-left'>
                        <Search size={16} strokeWidth={1.2} />
                      </span>
                      <Autosuggest
                        suggestions={suggestions}
                        onSuggestionsFetchRequested={onSuggestionsFetchRequested}
                        onSuggestionsClearRequested={onSuggestionsClearRequested}
                        getSuggestionValue={this.getSuggestionValue}
                        renderSuggestion={this.renderSuggestion}
                        inputProps={inputProps}
                        onSuggestionSelected={(_, item) => {
                          history.push(`/product/${item.suggestion.slug}`);
                        }}
                      />
                      {searchValue && (
                        <button className='search-clear-btn' onClick={() => onSearch('')} aria-label='Clear search'>
                          <X size={14} strokeWidth={1.2} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Wishlist Icon */}
                  <Link to='/wishlist' className='nav-icon-link d-none d-md-flex' aria-label='Wishlist' data-cursor="link">
                    <Heart size={18} strokeWidth={1.2} />
                  </Link>

                  {/* Account / User Menu Dropdown */}
                  <Dropdown isOpen={this.state.isDropdownOpen} toggle={this.toggleDropdown} className='account-dropdown-nav'>
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
                          <DropdownItem onClick={() => history.push('/dashboard')}>Dashboard</DropdownItem>
                          <DropdownItem onClick={signOut}>Sign Out</DropdownItem>
                        </>
                      ) : (
                        <>
                          <DropdownItem onClick={() => history.push('/login')}>Login</DropdownItem>
                          <DropdownItem onClick={() => history.push('/register')}>Sign Up</DropdownItem>
                        </>
                      )}
                    </DropdownMenu>
                  </Dropdown>

                  {/* Cart Icon */}
                  <CartIcon cartItems={cartItems} onClick={toggleCart} className='nav-cart-icon-btn' />
                </div>
              </div>
            </div>

            {/* Mobile-only Search Bar */}
            {this.state.isMobileSearchOpen && (
              <div className='mobile-search-bar d-lg-none py-2'>
                <div className='search-input-wrapper'>
                  <span className='search-icon-left'>
                    <Search size={16} strokeWidth={1.2} />
                  </span>
                  <Autosuggest
                    suggestions={suggestions}
                    onSuggestionsFetchRequested={onSuggestionsFetchRequested}
                    onSuggestionsClearRequested={onSuggestionsClearRequested}
                    getSuggestionValue={this.getSuggestionValue}
                    renderSuggestion={this.renderSuggestion}
                    inputProps={{ ...inputProps, placeholder: 'Search...' }}
                    onSuggestionSelected={(_, item) => {
                      history.push(`/product/${item.suggestion.slug}`);
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
        aria-hidden={`${isCartOpen ? false : true}`}
      >
        <div className='mini-cart'>
          <Cart />
        </div>
        <div
          className={isCartOpen ? 'drawer-backdrop dark-overflow' : 'drawer-backdrop'}
          onClick={toggleCart}
        />
      </div>

      {/* Full-screen Overlay Menu for Mobile */}
      <div
        className={`mobile-full-screen-menu ${isMenuOpen ? 'open' : ''}`}
        aria-hidden={`${isMenuOpen ? false : true}`}
      >
        <div className='menu-header-bar d-flex align-items-center justify-content-between px-4 py-3'>
          <span className='logo-text text-white'>CARTZA</span>
          <button className='menu-close-btn' onClick={() => this.toggleMenu()} aria-label='Close menu'>
            <X size={24} strokeWidth={1.2} className="text-white" />
          </button>
        </div>
        <div className='menu-body-overlay'>
          <Menu />
        </div>
      </div>
    </>
    );
  }
}

const mapStateToProps = state => {
  return {
    isMenuOpen: state.navigation.isMenuOpen,
    isCartOpen: state.navigation.isCartOpen,
    isBrandOpen: state.navigation.isBrandOpen,
    cartItems: state.cart.cartItems,
    brands: state.brand.storeBrands,
    categories: state.category.storeCategories,
    authenticated: state.authentication.authenticated,
    user: state.account.user,
    searchValue: state.navigation.searchValue,
    suggestions: state.navigation.searchSuggestions
  };
};

export default connect(mapStateToProps, actions)(withRouter(Navigation));
