/**
 * CustomCursor — CARTZA Premium Cursor
 *
 * Two DOM elements:
 * 1. .cursor-dot   — 6px filled accent circle, follows mouse exactly
 * 2. .cursor-ring  — 44px outline circle, follows with lerp lag
 *
 * States via data-cursor attribute:
 *   "link"    → ring expands to 70px
 *   "product" → ring 80px semi-transparent fill + "VIEW" text
 *   "cart"    → ring shows "CART"
 *   "drag"    → ring shows "DRAG ←→"
 *   "text"    → ring becomes thin vertical bar
 */

import React, { useEffect, useRef, useState } from 'react';

const CustomCursor = () => {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const mousePos = useRef({ x: 0, y: 0 });
  const ringPos = useRef({ x: 0, y: 0 });
  const rafId = useRef(null);
  const [cursorState, setCursorState] = useState('default');
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    // Don't render on touch devices
    if (window.matchMedia('(hover: none)').matches) {
      setIsTouch(true);
      return;
    }

    const onMouseMove = (e) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
      }
    };

    const onMouseOver = (e) => {
      const target = e.target.closest('[data-cursor]');
      if (target) {
        setCursorState(target.getAttribute('data-cursor'));
      } else {
        setCursorState('default');
      }
    };

    const lerp = () => {
      const ease = 0.12;
      ringPos.current.x += (mousePos.current.x - ringPos.current.x) * ease;
      ringPos.current.y += (mousePos.current.y - ringPos.current.y) * ease;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ringPos.current.x}px, ${ringPos.current.y}px) translate(-50%, -50%)`;
      }

      rafId.current = requestAnimationFrame(lerp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseover', onMouseOver);
    rafId.current = requestAnimationFrame(lerp);

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseover', onMouseOver);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  if (isTouch) return null;

  const getRingStyle = () => {
    const base = {
      position: 'fixed',
      top: 0,
      left: 0,
      pointerEvents: 'none',
      zIndex: 9998,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--font-mono)',
      fontSize: '0.55rem',
      letterSpacing: '0.1em',
      color: 'var(--color-accent)',
      transition: 'width 400ms cubic-bezier(0.16, 1, 0.3, 1), height 400ms cubic-bezier(0.16, 1, 0.3, 1), background 300ms, opacity 300ms, border-color 300ms',
      willChange: 'transform',
    };

    switch (cursorState) {
      case 'link':
        return { ...base, width: 70, height: 70, border: '1px solid var(--color-accent)', background: 'transparent' };
      case 'product':
        return { ...base, width: 80, height: 80, border: 'none', background: 'rgba(200, 169, 126, 0.25)', color: 'var(--color-canvas)' };
      case 'cart':
        return { ...base, width: 70, height: 70, border: '1px solid var(--color-accent)', background: 'rgba(200, 169, 126, 0.15)' };
      case 'drag':
        return { ...base, width: 80, height: 80, border: '1px solid var(--color-accent)', background: 'rgba(200, 169, 126, 0.1)' };
      case 'text':
        return { ...base, width: 2, height: 24, borderRadius: '1px', border: 'none', background: 'var(--color-accent)' };
      default:
        return { ...base, width: 44, height: 44, border: '1px solid var(--color-accent)', background: 'transparent' };
    }
  };

  const getRingText = () => {
    switch (cursorState) {
      case 'product': return 'VIEW';
      case 'cart': return 'CART';
      case 'drag': return 'DRAG ←→';
      default: return '';
    }
  };

  return (
    <>
      {/* Dot */}
      <div
        ref={dotRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: 'var(--color-accent)',
          pointerEvents: 'none',
          zIndex: 9999,
          willChange: 'transform',
          opacity: cursorState === 'link' || cursorState === 'product' || cursorState === 'text' ? 0 : 1,
          transition: 'opacity 200ms',
        }}
      />
      {/* Ring */}
      <div ref={ringRef} style={getRingStyle()}>
        {getRingText()}
      </div>
    </>
  );
};

export default CustomCursor;
