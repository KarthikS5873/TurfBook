import React from 'react';

/**
 * Customizable Spinner component
 * @param {String} [size='md'] - Spinner scale: 'sm', 'md', 'lg'
 */
const Spinner = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  };

  return (
    <div className="flex justify-center items-center">
      <div 
        className={`animate-spin rounded-full border-t-turf border-slate-700/60 ${sizeClasses[size]}`}
        style={{ borderStyle: 'solid', borderTopColor: '#10b981' }}
        role="status"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
};

export default Spinner;
