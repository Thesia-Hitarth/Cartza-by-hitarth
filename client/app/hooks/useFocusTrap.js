import { useEffect } from 'react';

export const useFocusTrap = (isActive, containerSelector) => {
  useEffect(() => {
    if (!isActive) return;

    const handleFocusTrap = (e) => {
      if (e.key !== 'Tab') return;

      const container = document.querySelector(containerSelector);
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
  }, [isActive, containerSelector]);
};
