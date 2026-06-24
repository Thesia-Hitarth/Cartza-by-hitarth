/**
 * SectionHeader — Reusable editorial section header
 *
 * Usage: <SectionHeader number="01" title="Shop by Category" link="/shop" linkText="View All" />
 *
 * Visual: — 01   Section Title                    View All →
 */

import React from 'react';
import { Link } from 'react-router-dom';

const SectionHeader = ({ number, title, link, linkText }) => {
  return (
    <div
      className="section-header-editorial"
      style={{
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        marginBottom: '2.5rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid var(--color-sand)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '1.5rem' }}>
        {number && (
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.65rem',
              fontWeight: 300,
              letterSpacing: 'var(--tracking-wide)',
              color: 'var(--color-accent)',
            }}
          >
            — {number}
          </span>
        )}
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.25rem, 5vw, 4.5rem)',
            fontWeight: 400,
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            color: 'var(--color-ink)',
            margin: 0,
          }}
        >
          {title}
        </h2>
      </div>
      {link && linkText && (
        <Link
          to={link}
          data-cursor="link"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontFamily: 'var(--font-body)',
            fontSize: '0.72rem',
            fontWeight: 400,
            letterSpacing: 'var(--tracking-wider)',
            textTransform: 'uppercase',
            color: 'var(--color-ink)',
            borderBottom: '1px solid var(--color-sand)',
            paddingBottom: '2px',
            transition: 'border-color 300ms cubic-bezier(0.16, 1, 0.3, 1), color 300ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {linkText} <span className="arrow" style={{ transition: 'transform 500ms cubic-bezier(0.16, 1, 0.3, 1)' }}>→</span>
        </Link>
      )}
    </div>
  );
};

export default SectionHeader;
