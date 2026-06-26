/**
 *
 * Input
 *
 */

import React from 'react';
import ReactStars from 'react-rating-stars-component';
import { Star, StarHalf } from 'lucide-react/dist/cjs/lucide-react.cjs';

const Input = props => {
  const {
    autoComplete,
    type,
    value,
    error,
    step,
    decimals,
    min,
    max,
    disabled,
    placeholder,
    rows,
    label,
    name,
    onInputChange,
    inlineElement
  } = props;

  const inputId = name ? `input-${name}` : undefined;

  const _onChange = e => {
    if (e.target.name == 'image') {
      onInputChange(e.target.name, e.target.files[0]);
    } else {
      onInputChange(e.target.name, e.target.value);
    }
  };

  if (type === 'textarea') {
    const styles = `input-box${error ? ' invalid' : ''}`;

    return (
      <div className={styles}>
        {label && <label htmlFor={inputId}>{label}</label>}
        <textarea
          id={inputId}
          onChange={e => {
            _onChange(e);
          }}
          rows={rows}
          name={name}
          value={value}
          placeholder={placeholder}
          className={'textarea-text'}
        />
        <span className='invalid-message'>{error && (Array.isArray(error) ? error[0] : error)}</span>
      </div>
    );
  } else if (type === 'number') {
    const styles = `input-box${error ? ' invalid' : ''}`;

    const handleOnInput = e => {
      if (!decimals) {
        e.target.value = e.target.value.replace(/[^0-9]*/g, '');
      }
    };
    return (
      <div className={styles}>
        {label && <label htmlFor={inputId}>{label}</label>}
        <input
          id={inputId}
          autoComplete={autoComplete}
          step={step}
          min={min || 0}
          max={max || null}
          onInput={handleOnInput}
          type={type}
          onChange={e => {
            _onChange(e);
          }}
          disabled={disabled}
          name={name}
          value={value}
          placeholder={placeholder}
          className={'input-number'}
        />
        <span className='invalid-message'>{error && (Array.isArray(error) ? error[0] : error)}</span>
      </div>
    );
  } else if (type === 'stars') {
    const styles = `input-box${error ? ' invalid' : ''}`;

    return (
      <div className={styles}>
        {label && <label>{label}</label>}
        <ReactStars
          name={name}
          count={5}
          size={30}
          color={'#C8BCA8'}
          activeColor={'#C8A97E'}
          a11y={true}
          isHalf={false}
          emptyIcon={<Star size={30} />}
          halfIcon={<StarHalf size={30} />}
          filledIcon={<Star size={30} />}
          value={value}
          onChange={value => {
            onInputChange(name, value);
          }}
        />
        <span className='invalid-message'>{error && (Array.isArray(error) ? error[0] : error)}</span>
      </div>
    );
  } else {
    const styles = `input-box${inlineElement ? ` inline-btn-box` : ''} ${
      error ? 'invalid' : ''
    }`;

    return (
      <div className={styles}>
        {label && <label htmlFor={inputId}>{label}</label>}
        <div className='input-text-block'>
          <input
            id={inputId}
            className={'input-text'}
            autoComplete={autoComplete}
            type={type}
            onChange={e => {
              _onChange(e);
            }}
            disabled={disabled}
            name={name}
            value={value}
            placeholder={placeholder}
          />
          {inlineElement}
        </div>
        <span className='invalid-message'>{error && (Array.isArray(error) ? error[0] : error)}</span>
      </div>
    );
  }
};

Input.defaultProps = {
  step: 1,
  decimals: true,
  rows: '4',
  inlineElement: null,
  autoComplete: 'on'
};

export default Input;
