const sanitizeHtml = (html) => {
  if (!html || typeof html !== 'string') return html;
  return html
    .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '')
    .replace(/<iframe[^>]*>([\s\S]*?)<\/iframe>/gi, '')
    .replace(/on\w+\s*=\s*"[^"]*"/gi, '')
    .replace(/on\w+\s*=\s*'[^']*'/gi, '')
    .replace(/javascript\s*:\s*/gi, '');
};

module.exports = { sanitizeHtml };
