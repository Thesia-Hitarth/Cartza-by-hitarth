/**
 *
 * Navigation
 *
 */

import React from 'react';
import { connect } from 'react-redux';
import { Link, NavLink, withRouter } from 'react-router-dom';
import Autosuggest from 'react-autosuggest';
import AutosuggestHighlightMatch from 'autosuggest-highlight/match';
import AutosuggestHighlightParse from 'autosuggest-highlight/parse';
import {
  Container,
  Row,
  Col,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from 'reactstrap';

import actions from '../../actions';
import CartIcon from '../../components/Common/CartIcon';
import { Heart, Search, User, X } from 'lucide-react/dist/cjs/lucide-react.cjs';
import Menu from '../NavigationMenu';
import Cart from '../Cart';

class Navigation extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      showAnnouncement: localStorage.getItem('cartza_announcement_dismissed') !== 'true',
      isDropdownOpen: false
    };
    this.dismissAnnouncement = this.dismissAnnouncement.bind(this);
    this.toggleDropdown = this.toggleDropdown.bind(this);
  }

  componentDidMount() {
    this.props.fetchStoreBrands();
    this.props.fetchStoreCategories();
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

    const inputProps = {
      placeholder: 'Search Products...',
      value: searchValue,
      onChange: (_, { newValue }) => {
        onSearch(newValue);
      }
    };

    return (
      <header className='header fixed-mobile-header'>
        {/* Tier 1: Announcement Bar */}
        {this.state.showAnnouncement && (
          <div className='announcement-bar'>
            <div className='announcement-ticker'>
              <span>Free Delivery on Orders Above ₹999 · Use Code CARTZA10 for 10% Off</span>
            </div>
            <button className='announcement-close' onClick={this.dismissAnnouncement} aria-label='Dismiss announcement'>
              <X size={14} strokeWidth={1.5} />
            </button>
          </div>
        )}

        {/* Tier 2: Main Nav */}
        <div className='main-nav-wrapper'>
          <Container>
            <div className='main-nav-inner d-flex align-items-center justify-content-between'>
              {/* Left Logo / Branding */}
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

                <Link to='/' className='brand-link'>
                  <span className='logo-text'>CARTZA</span>
                  <span className='logo-underline'></span>
                </Link>
              </div>

              {/* Center Search Bar */}
              <div className='nav-center d-none d-lg-block'>
                <div className='search-input-wrapper'>
                  <span className='search-icon-left'>
                    <Search size={18} strokeWidth={1.5} />
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
                      <X size={16} strokeWidth={1.5} />
                    </button>
                  )}
                </div>
              </div>

              {/* Right Controls & Icons */}
              <div className='nav-right d-flex align-items-center'>
                <div className='nav-icon-row d-flex align-items-center'>
                  {/* Search Icon for Mobile */}
                  <button className='nav-icon-btn d-lg-none mobile-search-trigger' aria-label='Search'>
                    <Search size={22} strokeWidth={1.5} />
                  </button>

                  {/* Wishlist Icon */}
                  <Link to='/dashboard' className='nav-icon-link d-none d-md-flex' aria-label='Wishlist'>
                    <Heart className='nav-icon' size={22} strokeWidth={1.5} />
                  </Link>

                  {/* Account / User Menu Dropdown */}
                  <Dropdown isOpen={this.state.isDropdownOpen} toggle={this.toggleDropdown} className='account-dropdown-nav'>
                    <DropdownToggle className='nav-icon-btn d-flex align-items-center' tag="button" aria-label='Account menu'>
                      <User className='nav-icon' size={22} strokeWidth={1.5} />
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

            {/* Mobile-only Search Bar (Visible when collapsed on mobile) */}
            <div className='mobile-search-bar d-lg-none py-2'>
              <div className='search-input-wrapper'>
                <span className='search-icon-left'>
                  <Search size={16} strokeWidth={1.5} />
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
          </Container>
        </div>

        {/* Tier 3: Category Nav Strip */}
        {categories && categories.length > 0 && (
          <div className='category-nav-strip d-none d-md-block'>
            <Container>
              <div className='category-strip-inner d-flex align-items-center justify-content-center'>
                <NavLink to='/shop' className='category-strip-item' activeClassName='active' exact>
                  All Products
                </NavLink>
                {categories.map((link, index) => (
                  <NavLink
                    key={index}
                    className='category-strip-item'
                    to={'/shop/category/' + link.slug}
                    activeClassName='active'
                    exact
                  >
                    {link.name}
                  </NavLink>
                ))}
              </div>
            </Container>
          </div>
        )}

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
              <X size={24} strokeWidth={1.5} className="text-white" />
            </button>
          </div>
          <div className='menu-body-overlay'>
            <Menu />
          </div>
        </div>
      </header>
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
