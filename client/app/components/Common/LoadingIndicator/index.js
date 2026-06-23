import React from 'react';

const LoadingIndicator = ({ inline = false, backdrop = false }) => {
  const spinner = (
    <div className={`loading-indicator-ctz${inline ? ' loading-indicator-ctz--inline' : ''}${backdrop ? ' loading-indicator-ctz--backdrop' : ''}`}>
      <svg className='loading-ring' viewBox='0 0 44 44' xmlns='http://www.w3.org/2000/svg'>
        <circle className='loading-ring__track' cx='22' cy='22' r='18' fill='none' strokeWidth='3' />
        <circle className='loading-ring__head'  cx='22' cy='22' r='18' fill='none' strokeWidth='3' />
      </svg>
    </div>
  );
  if (backdrop) return <div className='page-loading-overlay'>{spinner}</div>;
  return spinner;
};

export default LoadingIndicator;
