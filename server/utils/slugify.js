const crypto = require('crypto');

/**
 * Generates a clean URL-safe slug from a string.
 * @param {string} text - The input text.
 * @returns {string} The formatted slug.
 */
function slugify(text) {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')    // Remove all non-word characters except space and -
    .replace(/[\s_]+/g, '-')     // Replace spaces and underscores with -
    .replace(/-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')          // Trim - from start
    .replace(/-+$/, '')          // Trim - from end
    .substring(0, 120);          // Truncate to 120 characters
}

/**
 * Asynchronously generates a unique slug for a given Mongoose model.
 * If a conflict is found, appends a short 6-character random suffix.
 * @param {import('mongoose').Model} model - The Mongoose Model constructor.
 * @param {string} nameValue - The input string (e.g. brand name).
 * @param {import('mongoose').Types.ObjectId|null} docId - The current document ID to exclude from search.
 * @returns {Promise<string>} A promise resolving to the unique slug.
 */
async function generateUniqueSlug(model, nameValue, docId = null) {
  const baseSlug = slugify(nameValue || 'item');
  let slug = baseSlug;
  let isUnique = false;
  let attempts = 0;

  while (!isUnique && attempts < 10) {
    const query = { slug };
    if (docId) {
      query._id = { $ne: docId };
    }

    const existing = await model.findOne(query).select('_id').lean().exec();
    if (!existing) {
      isUnique = true;
    } else {
      attempts++;
      const suffix = crypto.randomBytes(3).toString('hex'); // 6 character hex suffix
      // Ensure the generated slug does not exceed the 120 character limit
      slug = `${baseSlug.substring(0, 113)}-${suffix}`;
    }
  }

  return slug;
}

module.exports = {
  slugify,
  generateUniqueSlug
};
