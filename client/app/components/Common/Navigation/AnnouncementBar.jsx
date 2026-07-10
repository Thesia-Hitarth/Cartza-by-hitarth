import React from 'react';
import { X } from 'lucide-react/dist/cjs/lucide-react.cjs';

const AnnouncementBar = ({ show, onDismiss }) => {
  if (!show) return null;
  return (
    <div className='announcement-bar'>
      <div className='announcement-ticker'>
        <span>Free Delivery on Orders Above ₹999  ✦  Use Code CARTZA10 for 10% Off  ✦  New Arrivals Every Monday</span>
      </div>
      <button className='announcement-close' onClick={onDismiss} aria-label='Dismiss announcement'>
        <X size={14} strokeWidth={1.2} />
      </button>
    </div>
  );
};

export default AnnouncementBar;
