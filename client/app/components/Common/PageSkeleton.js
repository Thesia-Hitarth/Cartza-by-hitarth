import React from 'react';

const PageSkeleton = () => (
  <div className="skeleton-container container py-5" style={{ opacity: 0.6 }}>
    <style>{`
      @keyframes shimmer {
        0% { background-position: -468px 0; }
        100% { background-position: 468px 0; }
      }
      .shimmer-element {
        background: #f6f7f8;
        background-image: linear-gradient(to right, #f6f7f8 0%, #edeef1 20%, #f6f7f8 40%, #f6f7f8 100%);
        background-repeat: no-repeat;
        background-size: 800px 104px;
        animation: shimmer 1.5s infinite linear;
      }
    `}</style>
    <div className="shimmer-element mb-4" style={{ height: '40px', width: '30%', borderRadius: '4px' }}></div>
    <div className="row">
      <div className="col-12 col-md-4 mb-4">
        <div className="shimmer-element" style={{ height: '300px', borderRadius: '8px' }}></div>
      </div>
      <div className="col-12 col-md-4 mb-4">
        <div className="shimmer-element" style={{ height: '300px', borderRadius: '8px' }}></div>
      </div>
      <div className="col-12 col-md-4 mb-4">
        <div className="shimmer-element" style={{ height: '300px', borderRadius: '8px' }}></div>
      </div>
    </div>
  </div>
);

export default PageSkeleton;
