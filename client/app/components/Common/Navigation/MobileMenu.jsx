import React from 'react';
import { X } from 'lucide-react/dist/cjs/lucide-react.cjs';
import Menu from '../../../containers/NavigationMenu';

const MobileMenu = ({ isOpen, onClose }) => (
  <div
    className={`mobile-full-screen-menu ${isOpen ? 'open' : ''}`}
    aria-hidden={!isOpen}
  >
    <div className='menu-header-bar d-flex align-items-center justify-content-between px-4 py-3'>
      <span className='logo-text text-white'>CARTZA</span>
      <button className='menu-close-btn' onClick={onClose} aria-label='Close menu'>
        <X size={24} strokeWidth={1.2} className="text-white" />
      </button>
    </div>
    <div className='menu-body-overlay'>
      <Menu />
    </div>
  </div>
);

export default MobileMenu;
