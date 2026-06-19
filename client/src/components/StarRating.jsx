import React from 'react';

/**
 * Star Rating component for feedback scoring
 * @param {Number} rating - Value score (1-5)
 * @param {Function} [onChange] - Interactive callback for selection
 * @param {Boolean} [interactive=false] - True to enable click selector
 */
const StarRating = ({ rating = 0, onChange, interactive = false }) => {
  const [hoverRating, setHoverRating] = React.useState(0);

  const handleClick = (value) => {
    if (interactive && onChange) {
      onChange(value);
    }
  };

  const handleMouseEnter = (value) => {
    if (interactive) {
      setHoverRating(value);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(0);
    }
  };

  const activeRating = hoverRating || rating;

  return (
    <div className="flex items-center space-x-1" onMouseLeave={handleMouseLeave}>
      {[1, 2, 3, 4, 5].map((starValue) => {
        const isFilled = starValue <= activeRating;
        return (
          <button
            key={starValue}
            type="button"
            disabled={!interactive}
            onClick={() => handleClick(starValue)}
            onMouseEnter={() => handleMouseEnter(starValue)}
            className={`transition duration-150 p-0.5 focus:outline-none ${
              interactive ? 'cursor-pointer transform hover:scale-110' : 'cursor-default'
            } ${isFilled ? 'text-accent-gold' : 'text-slate-600'}`}
          >
            <svg
              className="w-5 h-5 fill-current"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/ajax/svg"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;
