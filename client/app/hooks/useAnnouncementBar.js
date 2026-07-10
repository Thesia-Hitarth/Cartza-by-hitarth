import { useState } from 'react';
import { getStorageItem, setStorageItem } from '../utils/storage';

export const useAnnouncementBar = () => {
  const [showAnnouncement, setShowAnnouncement] = useState(() => {
    const dismissedAt = getStorageItem('cartza_announcement_dismissed_at');
    if (!dismissedAt) return true;
    // Dismiss announcement for 24 hours
    const oneDay = 24 * 60 * 60 * 1000;
    return Date.now() - Number(dismissedAt) > oneDay;
  });

  const dismissAnnouncement = () => {
    setShowAnnouncement(false);
    setStorageItem('cartza_announcement_dismissed_at', String(Date.now()));
  };

  return { showAnnouncement, dismissAnnouncement };
};
