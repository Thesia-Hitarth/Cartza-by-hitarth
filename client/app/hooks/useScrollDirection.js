import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useScrollDirection = () => {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [navHidden, setNavHidden] = useState(false);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const nextScrolled = location.pathname !== '/' ? true : currentScrollY > 80;
      setScrolled(nextScrolled);

      if (currentScrollY > lastScrollY && currentScrollY > 150) {
        setNavHidden(true); // scrolling down
      } else {
        setNavHidden(false); // scrolling up
      }
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Run initially
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  return { scrolled, navHidden };
};
