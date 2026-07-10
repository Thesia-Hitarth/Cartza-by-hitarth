import React, { useState } from 'react';

const VariantSelector = ({
  colors,
  sizes,
  selectedColor,
  selectedSize,
  onColorSelect,
  onSizeSelect,
  isColorDisabled,
  isSizeDisabled
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Color Swatch */}
      {colors && colors.length > 0 && (
        <div className='variant-swatch-block mb-3'>
          <div className='variant-label'>Color: <strong>{selectedColor}</strong></div>
          <div className='color-swatch-list d-flex align-items-center'>
            {colors.map((col, idx) => {
              const disabled = isColorDisabled(col);
              return (
                <button
                  key={idx}
                  disabled={disabled}
                  className={`color-swatch-btn ${selectedColor === col ? 'active' : ''} ${col.toLowerCase().replace(/\s+/g, '-')} ${disabled ? 'disabled' : ''}`}
                  onClick={() => onColorSelect(col)}
                  title={col}
                  aria-label={`Select color ${col}`}
                ></button>
              );
            })}
          </div>
        </div>
      )}

      {/* Size Selectors */}
      {sizes && sizes.length > 0 && (
        <div className='variant-swatch-block mb-4'>
          <div className='variant-label d-flex align-items-center justify-content-between'>
            <span>Size: <strong>{selectedSize}</strong></span>
            <button 
              className="tw-text-xs tw-text-accent tw-underline tw-border-none tw-bg-transparent tw-cursor-pointer hover:tw-text-accent-dark"
              onClick={() => setIsOpen(true)}
              type="button"
            >
              Size Guide
            </button>
          </div>
          <div className='size-swatch-list d-flex align-items-center'>
            {sizes.map((sz, idx) => {
              const disabled = isSizeDisabled(sz);
              return (
                <button
                  key={idx}
                  disabled={disabled}
                  className={`size-swatch-btn ${selectedSize === sz ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
                  onClick={() => onSizeSelect(sz)}
                  aria-label={`Select size ${sz}`}
                >
                  {sz}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Size Guide Modal Overlay */}
      {isOpen && (
        <div className='tw-fixed tw-inset-0 tw-bg-ink/50 tw-flex tw-items-center tw-justify-center tw-z-50 tw-p-4'>
          <div className='tw-bg-canvas tw-border tw-border-border tw-rounded-lg tw-w-full tw-max-w-md tw-p-6 tw-relative tw-font-body tw-shadow-lg'>
            <button 
              className='tw-absolute tw-top-4 tw-right-4 tw-text-ink tw-font-bold tw-bg-transparent tw-border-none tw-cursor-pointer tw-text-lg' 
              onClick={() => setIsOpen(false)}
              type="button"
            >
              ✕
            </button>
            <h4 className='tw-text-base tw-font-bold tw-mb-4 tw-text-ink' style={{ margin: '0 0 16px' }}>Size Guide & Measurement</h4>
            <div className='tw-overflow-x-auto'>
              <table className='tw-w-full tw-text-left tw-border-collapse'>
                <thead>
                  <tr className='tw-border-b tw-border-border tw-text-xs tw-uppercase tw-text-muted'>
                    <th className='tw-py-2'>Size</th>
                    <th className='tw-py-2'>Chest (in)</th>
                    <th className='tw-py-2'>Waist (in)</th>
                    <th className='tw-py-2'>Hips (in)</th>
                  </tr>
                </thead>
                <tbody className='tw-text-sm tw-text-ink'>
                  <tr className='tw-border-b tw-border-border/50'>
                    <td className='tw-py-2 tw-font-bold'>S</td>
                    <td className='tw-py-2'>34-36</td>
                    <td className='tw-py-2'>28-30</td>
                    <td className='tw-py-2'>35-37</td>
                  </tr>
                  <tr className='tw-border-b tw-border-border/50'>
                    <td className='tw-py-2 tw-font-bold'>M</td>
                    <td className='tw-py-2'>38-40</td>
                    <td className='tw-py-2'>32-34</td>
                    <td className='tw-py-2'>39-41</td>
                  </tr>
                  <tr className='tw-border-b tw-border-border/50'>
                    <td className='tw-py-2 tw-font-bold'>L</td>
                    <td className='tw-py-2'>42-44</td>
                    <td className='tw-py-2'>36-38</td>
                    <td className='tw-py-2'>43-45</td>
                  </tr>
                  <tr className='tw-border-b tw-border-border/50'>
                    <td className='tw-py-2 tw-font-bold'>XL</td>
                    <td className='tw-py-2'>46-48</td>
                    <td className='tw-py-2'>40-42</td>
                    <td className='tw-py-2'>47-49</td>
                  </tr>
                  <tr>
                    <td className='tw-py-2 tw-font-bold'>XXL</td>
                    <td className='tw-py-2'>50-52</td>
                    <td className='tw-py-2'>44-46</td>
                    <td className='tw-py-2'>51-53</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className='tw-text-xs tw-text-muted tw-mt-4 tw-mb-0'>
              * All measurements are apparel standard guidelines. Fits may vary slightly depending on model.
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default VariantSelector;
