/**
 *
 * List
 *
 */

import React from 'react';

import ReactStars from 'react-rating-stars-component';
import { Star, StarHalf } from 'lucide-react/dist/cjs/lucide-react.cjs';

import { formatDate } from '../../../utils/date';
import { getRandomColors } from '../../../utils';

const List = props => {
  const { reviews } = props;

  const getAvatar = review => {
    const name = review.user.firstName || '';
    const char = name.charAt(0).toUpperCase();
    // Deterministic selection from premium colors
    const charCode = char.charCodeAt(0) || 0;
    const premiumColors = [
      '#C8A97E', // gold
      '#0A0A0A', // ink
      '#8A8278', // muted gray
      '#9E7B50'  // dark gold
    ];
    const color = premiumColors[charCode % premiumColors.length];

    if (name) {
      return (
        <div
          className='d-flex flex-column justify-content-center align-items-center fw-normal text-white avatar'
          style={{ backgroundColor: color }}
        >
          {char}
        </div>
      );
    }
  };

  return (
    <div className='review-list'>
      {reviews.map((review, index) => (
        <div className='d-flex align-items-center mb-3 review-box' key={index}>
          <div className='mx-3'>{getAvatar(review)}</div>
          <div className='p-3 p-lg-4 w-100'>
            <div className='d-flex align-items-center justify-content-between'>
              <h4 className='mb-0 mr-2 one-line-ellipsis'>{review.title}</h4>
              <ReactStars
                classNames='mr-2'
                size={16}
                edit={false}
                color={'#C8BCA8'}
                activeColor={'#C8A97E'}
                a11y={true}
                isHalf={true}
                emptyIcon={<Star size={16} />}
                halfIcon={<StarHalf size={16} />}
                filledIcon={<Star size={16} />}
                value={review.rating}
              />
            </div>
            <p className='mb-2 fs-12'>{formatDate(`${review?.created}`)}</p>
            <p className='mb-0 three-line-ellipsis word-break-all'>{`${review?.review}`}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default React.memo(List);
