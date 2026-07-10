/**
 * Helper to dynamically transform Cloudinary URLs to include f_auto, q_auto, and optional w_width.
 * @param {string} url - Original image URL
 * @param {number|string} [width] - Desired width parameter
 */
export const getCloudinaryUrl = (url, width) => {
  if (!url) return '/images/placeholder-image.png';
  if (!url.includes('res.cloudinary.com')) return url;

  // Split at /upload/ to insert transformations
  const parts = url.split('/upload/');
  if (parts.length === 2) {
    const transformations = ['f_auto', 'q_auto'];
    if (width) {
      transformations.push(`w_${width}`);
    }
    return `${parts[0]}/upload/${transformations.join(',')}/${parts[1]}`;
  }

  return url;
};
