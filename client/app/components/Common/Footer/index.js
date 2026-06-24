import React from 'react';
import { Link } from 'react-router-dom';
import { Container } from 'reactstrap';
import { Instagram, Twitter } from 'lucide-react/dist/cjs/lucide-react.cjs';

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

  const connectLinks = [
    { name: 'About Us', to: '/contact' },
    { name: 'Careers', to: '/contact' },
    { name: 'Press & Media', to: '/contact' },
    { name: 'Privacy Policy', to: '/contact' }
  ];

  return (
    <footer className='footer-redesign' data-animate="fade-up">
      {/* Main Footer Grid */}
      <div className='footer-main-grid'>
        <Container>
          <div className='footer-grid-inner'>
            {/* Column 1: Brand */}
            <div className='footer-brand-col'>
              <h3 className='footer-logo'>
                <span className='footer-logo-italic'>Cartza</span>
              </h3>
              <p className='footer-tagline'>
                Curated for those who live<br />with intention.
              </p>
              <div className='footer-social-row'>
                <a href='#instagram' aria-label='Instagram' className='footer-social-icon' data-cursor="link">
                  <Instagram size={16} strokeWidth={1.2} />
                </a>
                <a href='#twitter' aria-label='Twitter' className='footer-social-icon' data-cursor="link">
                  <Twitter size={16} strokeWidth={1.2} />
                </a>
              </div>
            </div>

            {/* Column 2: Shop */}
            <div className='footer-links-col'>
              <h4 className='footer-col-heading'>SHOP</h4>
              <ul>
                {shopLinks.map((item, idx) => (
                  <li key={idx}>
                    <Link to={item.to} className='footer-link' data-cursor="link">{item.name}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Help */}
            <div className='footer-links-col'>
              <h4 className='footer-col-heading'>HELP</h4>
              <ul>
                {helpLinks.map((item, idx) => (
                  <li key={idx}>
                    <Link to={item.to} className='footer-link' data-cursor="link">{item.name}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4: Connect */}
            <div className='footer-links-col'>
              <h4 className='footer-col-heading'>CONNECT</h4>
              <ul>
                {connectLinks.map((item, idx) => (
                  <li key={idx}>
                    <Link to={item.to} className='footer-link' data-cursor="link">{item.name}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </div>

      {/* Bottom Copyright Strip */}
      <div className='footer-bottom-strip'>
        <Container>
          <div className='footer-bottom-inner'>
            <span className='footer-copyright'>
              © {new Date().getFullYear()} CARTZA. All rights reserved.
            </span>
            <div className='footer-bottom-links'>
              <Link to='/contact' className='footer-bottom-link' data-cursor="link">Privacy</Link>
              <span className='footer-dot'>·</span>
              <Link to='/contact' className='footer-bottom-link' data-cursor="link">Terms</Link>
            </div>
          </div>
        </Container>
      </div>
    </footer>
  );
};

export default Footer;
