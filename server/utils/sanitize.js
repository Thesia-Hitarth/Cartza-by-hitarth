/**
 * sanitize.js
 * Server-side HTML sanitization using the `sanitize-html` library.
 * Replaces the previous custom regex approach which was bypassable by
 * sophisticated XSS payloads (mutation XSS, CSS injection, etc.)
 */

const sanitizeHtmlLib = require('sanitize-html');

/**
 * Strips all HTML from a string, allowing only a safe, minimal subset.
 * For rich product descriptions, adjust allowedTags/allowedAttributes below.
 * Currently configured for PLAIN TEXT only (no HTML tags permitted).
 * @param {string} dirty - User-supplied string
 * @returns {string}     - Sanitized string safe to store and render
 */
const sanitizeHtml = (dirty) => {
  if (typeof dirty !== 'string') return dirty;
  // Strip ALL HTML - use allowedTags/allowedAttributes for rich content
  return sanitizeHtmlLib(dirty, {
    allowedTags: [],
    allowedAttributes: {}
  });
};

module.exports = { sanitizeHtml };
