const crypto = require('crypto');

/**
 * csrf.js — Two-layer CSRF protection:
 *
 * Layer 1 (primary): Origin header check.
 *   The browser always sends the Origin header on cross-origin POST requests.
 *   We accept the request if the Origin matches CLIENT_URL or the request's
 *   own Host (handles Vercel preview deployments automatically).
 *
 * Layer 2 (secondary): Double Submit Cookie (XSRF-TOKEN / X-XSRF-TOKEN).
 *   Falls back to this if Origin is absent (some same-origin requests omit it).
 *
 * Skips for: test env, webhook callbacks, safe HTTP methods.
 */

const MUTATING_METHODS = new Set(['POST', 'PUT', 'DELETE', 'PATCH']);
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

const extractCookieToken = (req) => {
  if (!req.headers.cookie) return null;
  const parts = `; ${req.headers.cookie}`.split('; XSRF-TOKEN=');
  return parts.length === 2 ? parts.pop().split(';').shift() : null;
};

const csrfProtection = (req, res, next) => {
  // Safe methods — issue / refresh the XSRF-TOKEN cookie so the client
  // can use it for the Double Submit layer on subsequent mutations.
  if (SAFE_METHODS.has(req.method)) {
    if (!extractCookieToken(req)) {
      const newToken = crypto.randomBytes(24).toString('hex');
      res.cookie('XSRF-TOKEN', newToken, {
        httpOnly: false, // Must be readable by JS (Axios interceptor)
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        path: '/'
      });
    }
    return next();
  }

  // Mutating methods — validate CSRF
  if (MUTATING_METHODS.has(req.method)) {
    // Always skip in test environment
    if (process.env.NODE_ENV === 'test') return next();

    // Always skip Razorpay / payment webhooks
    if (req.originalUrl && req.originalUrl.startsWith('/api/webhook')) return next();

    // ── Layer 1: Origin header check ─────────────────────────────────────
    const origin = req.headers.origin;
    if (origin) {
      const clientUrl = process.env.CLIENT_URL || '';
      // Derive the server's own origin from the request host
      const proto = req.headers['x-forwarded-proto'] || req.protocol || 'https';
      const host = req.headers['x-forwarded-host'] || req.headers.host || '';
      const serverOrigin = host ? `${proto}://${host}` : '';

      const allowed = [clientUrl, serverOrigin].filter(Boolean);
      const originIsAllowed = allowed.some(a => origin === a || origin.startsWith(a));

      if (originIsAllowed) return next(); // ✅ same-origin request
      // If Origin is present but doesn't match — reject immediately
      return res.status(403).json({ error: 'CSRF origin check failed.' });
    }

    // ── Layer 2: Double Submit Cookie fallback ────────────────────────────
    // Handles same-origin requests where browsers omit the Origin header
    // (e.g. form submissions navigating from the same page).
    const cookieToken = extractCookieToken(req);
    const headerToken = req.headers['x-xsrf-token'];

    if (cookieToken && headerToken && cookieToken === headerToken) {
      return next(); // ✅ tokens match
    }

    return res.status(403).json({ error: 'CSRF token validation failed.' });
  }

  next();
};

module.exports = csrfProtection;
