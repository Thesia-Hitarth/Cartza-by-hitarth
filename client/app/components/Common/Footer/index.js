import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col } from 'reactstrap';
import { Facebook, Instagram, Twitter, Pin } from 'lucide-react/dist/cjs/lucide-react.cjs';

import Newsletter from '../../../containers/Newsletter';

const Footer = () => {
  const shopLinks = [
    { name: 'All Products', to: '/shop' },
    { name: 'Featured Brands', to: '/brands' },
    { name: 'Sell on Cartza', to: '/sell' },
    { name: 'Contact Support', to: '/contact' }
  ];

  const helpLinks = [
    { name: 'Order Tracking', to: '/dashboard' },
    { name: 'Shipping & Delivery', to: '/contact' },
    { name: 'Returns & Exchanges', to: '/contact' },
    { name: 'FAQs', to: '/contact' }
  ];

  const companyLinks = [
    { name: 'About Us', to: '/contact' },
    { name: 'Careers', to: '/contact' },
    { name: 'Press & Media', to: '/contact' },
    { name: 'Privacy Policy', to: '/contact' }
  ];

  return (
    <footer className='footer-redesign' data-animate="fade-up">
      {/* Top section: Newsletter band */}
      <div className='footer-newsletter-band py-5'>
        <Container>
          <Newsletter />
        </Container>
      </div>

      {/* Main footer grid */}
      <div className='footer-main-grid py-5'>
        <Container>
          <Row>
            {/* Column 1: Brand Info */}
            <Col xs='12' md='6' lg='4' className='mb-4 mb-lg-0'>
              <div className='footer-brand-info'>
                <h3 className='footer-logo-text mb-3'>CARTZA</h3>
                <p className='footer-tagline mb-4'>
                  Cartza is your premier destination for curated fashion, electronics, and premium urban lifestyle accessories. Designed for modern living.
                </p>
                <ul className='footer-social-row d-flex align-items-center list-unstyled p-0 m-0'>
                  <li className='mr-3'>
                    <a href='#facebook' aria-label='Facebook' className='social-icon-link'>
                      <Facebook size={15} strokeWidth={1.5} />
                    </a>
                  </li>
                  <li className='mr-3'>
                    <a href='#instagram' aria-label='Instagram' className='social-icon-link'>
                      <Instagram size={15} strokeWidth={1.5} />
                    </a>
                  </li>
                  <li className='mr-3'>
                    <a href='#twitter' aria-label='Twitter' className='social-icon-link'>
                      <Twitter size={15} strokeWidth={1.5} />
                    </a>
                  </li>
                  <li>
                    <a href='#pinterest' aria-label='Pinterest' className='social-icon-link'>
                      <Pin size={15} strokeWidth={1.5} />
                    </a>
                  </li>
                </ul>
              </div>
            </Col>

            {/* Column 2: Shop Links */}
            <Col xs='6' md='3' lg='2' className='mb-4 mb-md-0'>
              <div className='footer-links-column'>
                <h4 className='footer-column-header mb-3'>Shop</h4>
                <ul className='list-unstyled p-0 m-0'>
                  {shopLinks.map((item, idx) => (
                    <li key={idx} className='mb-2'>
                      <Link to={item.to} className='footer-link-item'>{item.name}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            </Col>

            {/* Column 3: Help Links */}
            <Col xs='6' md='3' lg='2' className='mb-4 mb-md-0'>
              <div className='footer-links-column'>
                <h4 className='footer-column-header mb-3'>Help</h4>
                <ul className='list-unstyled p-0 m-0'>
                  {helpLinks.map((item, idx) => (
                    <li key={idx} className='mb-2'>
                      <Link to={item.to} className='footer-link-item'>{item.name}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            </Col>

            {/* Column 4: Company Links */}
            <Col xs='6' md='3' lg='2'>
              <div className='footer-links-column'>
                <h4 className='footer-column-header mb-3'>Company</h4>
                <ul className='list-unstyled p-0 m-0'>
                  {companyLinks.map((item, idx) => (
                    <li key={idx} className='mb-2'>
                      <Link to={item.to} className='footer-link-item'>{item.name}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            </Col>

            {/* Column 5: App Download */}
            <Col xs='6' md='3' lg='2'>
              <div className='footer-links-column'>
                <h4 className='footer-column-header mb-3'>App</h4>
                <p className='footer-app-text mb-3'>Download our mobile app for better deals and quick tracking.</p>
                <div className='app-store-badges d-flex flex-column gap-2'>
                  <span className='app-badge-pill mb-2'>Google Play</span>
                  <span className='app-badge-pill'>App Store</span>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Bottom Copyright and Payment Row */}
      <div className='footer-bottom-bar py-4'>
        <Container>
          <div className='d-flex flex-column flex-md-row align-items-center justify-content-between text-center text-md-left'>
            <div className='copyright-text mb-3 mb-md-0'>
              © {new Date().getFullYear()} CARTZA Ltd. All Rights Reserved. Designed with passion.
            </div>
            
            {/* Grayscale payment SVGs */}
            <div className='payment-icons-row d-flex align-items-center'>
              <span className='payment-icon-wrapper mr-3' title='Visa'>
                <svg width="36" height="24" viewBox="0 0 36 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="36" height="24" rx="3" fill="#F8FAFC"/>
                  <path d="M15.4 7.6L13.1 16H11.2L9.4 9.3C9.2 8.7 9 8.5 8.5 8.2C7.9 7.9 6.9 7.6 6 7.4L6.1 7.2H9.3C9.7 7.2 10.1 7.5 10.2 8L11.2 13.5L13.2 7.6H15.4ZM20.6 11.2C20.6 9.6 18.6 9.5 18.6 8.7C18.6 8.4 18.9 8.1 19.5 8C19.8 8 20.6 8 21.3 8.3L21.7 6.8C21 6.5 20.2 6.4 19.3 6.4C17.6 6.4 16.4 7.3 16.4 8.7C16.4 10.6 19.2 10.7 19.2 11.8C19.2 12.1 18.8 12.4 18.2 12.5C17.5 12.5 16.9 12.2 16.5 12L16.1 13.6C16.8 13.9 17.7 14.1 18.6 14.1C20.4 14.1 20.6 12.8 20.6 11.2ZM24.4 7.2C23.9 7.2 23.5 7.5 23.3 8L20.4 16H22.3L22.7 14.8H24.9L25.1 16H26.8L25.3 8C25.1 7.5 24.8 7.2 24.4 7.2ZM23.2 13.2L24.1 9.4L24.6 13.2H23.2ZM30 7.2H28.4C28 7.2 27.7 7.4 27.5 7.8L24.8 16H26.7L27.1 14.8H29.5L29.9 16H31.6L30 7.2ZM27.6 13.2L28.5 9.4L29 13.2H27.6Z" fill="#64748B" className="icon-path"/>
                </svg>
              </span>
              <span className='payment-icon-wrapper mr-3' title='Mastercard'>
                <svg width="36" height="24" viewBox="0 0 36 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="36" height="24" rx="3" fill="#F8FAFC"/>
                  <circle cx="15" cy="12" r="7" fill="#64748B" fillOpacity="0.7"/>
                  <circle cx="21" cy="12" r="7" fill="#64748B"/>
                </svg>
              </span>
              <span className='payment-icon-wrapper' title='Razorpay'>
                <svg width="36" height="24" viewBox="0 0 36 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="36" height="24" rx="3" fill="#F8FAFC"/>
                  <path d="M12 17L14.5 7.5H19L16.5 17H12ZM19 7.5L21.5 17H24L21.5 7.5H19Z" fill="#64748B" className="icon-path"/>
                </svg>
              </span>
            </div>
          </div>
        </Container>
      </div>
    </footer>
  );
};

export default Footer;
