/**
 *
 * ProductFilter
 *
 */

import React from 'react';
import { Card, CardHeader, CardBody } from 'reactstrap';
import { Star } from 'lucide-react/dist/cjs/lucide-react.cjs';

import RangeSlider from '../../Common/RangeSlider';

const priceMarks = {
  1: { label: <p className='fw-normal text-black'>₹1</p> },
  5000: { label: <p className='fw-normal text-black'>₹5000</p> }
};

const rateMarks = {
  0: {
    label: (
      <span>
        <span className='mr-1'>5</span>
        <Star size={14} strokeWidth={1.5} fill='#FF8C42' color='#FF8C42' style={{ display: 'inline-block', verticalAlign: 'middle' }} />
      </span>
    )
  },
  20: {
    label: (
      <span>
        <span className='mr-1'>4</span>
        <Star size={14} strokeWidth={1.5} fill='#FF8C42' color='#FF8C42' style={{ display: 'inline-block', verticalAlign: 'middle' }} />
      </span>
    )
  },
  40: {
    label: (
      <span>
        <span className='mr-1'>3</span>
        <Star size={14} strokeWidth={1.5} fill='#FF8C42' color='#FF8C42' style={{ display: 'inline-block', verticalAlign: 'middle' }} />
      </span>
    )
  },
  60: {
    label: (
      <span>
        <span className='mr-1'>2</span>
        <Star size={14} strokeWidth={1.5} fill='#FF8C42' color='#FF8C42' style={{ display: 'inline-block', verticalAlign: 'middle' }} />
      </span>
    )
  },
  80: {
    label: (
      <span>
        <span className='mr-1'>1</span>
        <Star size={14} strokeWidth={1.5} fill='#FF8C42' color='#FF8C42' style={{ display: 'inline-block', verticalAlign: 'middle' }} />
      </span>
    )
  },
  100: { label: <span>Any</span> }
};

const rating = v => {
  switch (v) {
    case 100:
      return 0;
    case 80:
      return 1;
    case 60:
      return 2;
    case 40:
      return 3;
    case 20:
      return 4;
    default:
      0;
      return 5;
  }
};

const ProductFilter = props => {
  const { filterProducts } = props;

  return (
    <div className='product-filter'>
      <Card className='mb-4'>
        <CardHeader tag='h3'>Price</CardHeader>
        <CardBody>
          <div className='mx-2 mb-3'>
            <RangeSlider
              marks={priceMarks}
              defaultValue={[1, 2500]}
              max={5000}
              onChange={v => {
                filterProducts('price', v);
              }}
            />
          </div>
        </CardBody>
      </Card>
      <Card>
        <CardHeader tag='h3'>Rating</CardHeader>
        <CardBody>
          <div className='mx-2 mb-4'>
            <RangeSlider
              type='slider'
              marks={rateMarks}
              step={20}
              defaultValue={[100]}
              onChange={v => {
                filterProducts('rating', rating(v));
              }}
            />
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default ProductFilter;
