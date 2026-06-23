/**
 *
 * AddToWishList
 *
 */

import React from 'react';

import Checkbox from '../../Common/Checkbox';
import { Heart } from 'lucide-react';

const AddToWishList = props => {
  const { id, liked, enabled, updateWishlist } = props;

  return (
    <div className='add-to-wishlist'>
      <Checkbox
        id={`checkbox_${id}`}
        name={'wishlist'}
        disabled={!enabled}
        checked={liked}
        label={<Heart size={20} strokeWidth={1.5} fill={liked ? '#FF3D00' : 'none'} color={liked ? '#FF3D00' : '#6B7280'} />}
        onChange={(_, value) => {
          updateWishlist(value, id);
        }}
      />
    </div>
  );
};

export default AddToWishList;
