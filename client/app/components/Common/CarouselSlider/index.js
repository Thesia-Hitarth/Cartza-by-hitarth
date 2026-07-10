/**
 *
 * Carousel
 *
 */

import React from 'react';

import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';

const CarouselSlider = ({
  swipeable = false,
  draggable = false,
  showDots = false,
  infinite = true,
  autoPlay = false,
  keyBoardControl = true,
  autoPlaySpeed = 2000,
  ssr = false,
  responsive,
  children
}) => {
  return (
    <Carousel
      swipeable={swipeable}
      draggable={draggable}
      showDots={showDots}
      infinite={infinite}
      autoPlay={autoPlay}
      keyBoardControl={keyBoardControl}
      autoPlaySpeed={autoPlaySpeed}
      ssr={ssr}
      responsive={responsive}
      transitionDuration={500}
      containerClass='carousel-container'
      dotListClass='carousel-dot-list-style'
      itemClass='carousel-slider-item'
    >
      {children}
    </Carousel>
  );
};

export default CarouselSlider;
