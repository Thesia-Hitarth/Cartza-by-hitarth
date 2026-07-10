import React, { useState } from 'react';
import { getCloudinaryUrl } from '../../../utils/cloudinary';

const ImageGallery = ({ images, currentQty }) => {
  const [activeThumbIdx, setActiveThumbIdx] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState('center');

  let productImages = ['/images/placeholder-image.png'];
  if (images && images.length > 0) {
    productImages = images;
  }
  const currentImage = productImages[activeThumbIdx] || productImages[0];

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos(`${x}% ${y}%`);
    setIsZoomed(true);
  };

  const handleMouseLeave = () => {
    setIsZoomed(false);
  };

  return (
    <div className='product-gallery'>
      {/* Primary Zoom Image */}
      <div
        className='primary-image-container'
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ cursor: 'zoom-in' }}
      >
        <div
          className='zoom-target-image'
          style={{
            backgroundImage: `url(${getCloudinaryUrl(currentImage, 800)})`,
            backgroundPosition: isZoomed ? zoomPos : 'center',
            backgroundSize: isZoomed ? '200%' : 'contain',
            backgroundRepeat: 'no-repeat'
          }}
        />
        {currentQty <= 0 ? (
          <span className='stock-badge out-of-stock'>Sold Out</span>
        ) : (
          <span className='stock-badge in-stock'>In Stock</span>
        )}
      </div>

      {/* Thumbnail Strip */}
      {productImages.length > 1 && (
        <div className='thumbnail-strip d-flex mt-3'>
          {productImages.map((thumb, idx) => (
            <button
              key={idx}
              className={`thumb-button ${activeThumbIdx === idx ? 'active' : ''}`}
              onClick={() => setActiveThumbIdx(idx)}
              aria-label={`Select image variant ${idx + 1}`}
            >
              <img
                src={getCloudinaryUrl(thumb, 64)}
                alt=''
                className='thumb-img'
                loading="lazy"
                width={64}
                height={64}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
