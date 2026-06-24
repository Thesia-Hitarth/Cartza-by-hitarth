/**
 * Marquee — Ticker Strip Component
 *
 * Inspired by Voldog's ticker.
 * Props:
 *   speed    — animation duration in seconds (default: 28)
 *   bg       — 'accent' | 'charcoal' | 'transparent'
 *   textColor — 'white' | 'accent' | 'ink'
 *   children — ticker text content
 */

import React, { useState } from 'react';

const bgMap = {
  accent: 'var(--color-accent)',
  charcoal: 'var(--color-charcoal)',
  transparent: 'transparent',
};

const textMap = {
  white: 'var(--color-canvas)',
  accent: 'var(--color-accent)',
  ink: 'var(--color-ink)',
};

const Marquee = ({ speed = 28, bg = 'accent', textColor = 'white', children }) => {
  const [paused, setPaused] = useState(false);

  const content = children || 'FREE DELIVERY ON ₹999+  ✦  NEW ARRIVALS WEEKLY  ✦  30-DAY RETURNS  ✦  4.9★ RATED  ✦';

  return (
    <div
      className="marquee-strip"
      style={{
        height: 44,
        background: bgMap[bg] || bgMap.accent,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        zIndex: 10,
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="marquee-track"
        style={{
          display: 'flex',
          width: 'max-content',
          animation: `marquee ${speed}s linear infinite`,
          animationPlayState: paused ? 'paused' : 'running',
        }}
      >
        {/* Duplicate content for seamless loop */}
        {[0, 1].map((i) => (
          <span
            key={i}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.65rem',
              fontWeight: 300,
              letterSpacing: 'var(--tracking-wider)',
              textTransform: 'uppercase',
              color: textMap[textColor] || textMap.white,
              whiteSpace: 'nowrap',
              paddingRight: '4rem',
            }}
          >
            {content}
          </span>
        ))}
      </div>
    </div>
  );
};

export default Marquee;
