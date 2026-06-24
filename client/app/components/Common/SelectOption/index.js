/**
 *
 * SelectOption
 *
 */

import React from 'react';

import Select from 'react-select';
import makeAnimated from 'react-select/animated';

const SelectOption = props => {
  const {
    disabled,
    error,
    label,
    multi,
    options,
    defaultValue,
    value,
    handleSelectChange,
    isSearchable = true,
    noBorder = false
  } = props;

  const _handleSelectChange = value => {
    handleSelectChange(value);
  };

  const animatedComponents = makeAnimated();

  const styles = `select-box${error ? ' invalid' : ''}`;

  const customStyles = getDropdownStyles(noBorder);

  return (
    <div className={styles}>
      {label && <label>{label}</label>}
      <Select
        isDisabled={disabled}
        isSearchable={isSearchable}
        className='select-container'
        classNamePrefix='react-select'
        components={animatedComponents}
        isMulti={multi}
        options={options}
        defaultValue={defaultValue}
        value={value}
        onChange={_handleSelectChange}
        styles={customStyles}
      />
      <span className='invalid-message'>{error && error[0]}</span>
    </div>
  );
};

export default SelectOption;

const getDropdownStyles = noBorder => ({
  control: (styles, { isFocused }) => {
    const baseBorderStyles = noBorder
      ? {
          border: 'none',
          borderBottom: isFocused ? '1px solid var(--color-ink)' : '1px solid var(--color-sand)',
          borderRadius: 0
        }
      : {
          borderColor: isFocused ? 'var(--color-ink)' : 'var(--color-sand)'
        };

    const hoverBorderStyles = noBorder
      ? {
          border: 'none',
          borderBottom: '1px solid var(--color-ink)'
        }
      : {
          borderColor: !isFocused ? 'var(--color-sand)' : 'var(--color-ink)'
        };

    return {
      ...styles,
      color: 'var(--color-ink)',
      fontFamily: 'var(--font-body)',
      backgroundColor: 'transparent',
      transition: '0.3s',
      boxShadow: 'none',
      minHeight: '36px',
      height: '36px',
      ...baseBorderStyles,

      ':hover': {
        ...styles[':hover'],
        ...hoverBorderStyles,
        boxShadow: 'none'
      }
    };
  },
  valueContainer: styles => ({
    ...styles,
    padding: '0 8px',
    height: '30px',
    display: 'flex',
    alignItems: 'center'
  }),
  indicatorsContainer: styles => ({
    ...styles,
    height: '30px'
  }),
  menu: styles => {
    return {
      ...styles,
      zIndex: 2,
      backgroundColor: 'var(--color-canvas)',
      border: '1px solid var(--color-sand)'
    };
  },
  option: (styles, { isDisabled, isFocused, isSelected }) => {
    return {
      ...styles,
      color: 'var(--color-ink)',
      fontFamily: 'var(--font-body)',
      fontSize: '0.82rem',
      backgroundColor: isDisabled
        ? undefined
        : isSelected
          ? 'var(--color-sand)'
          : isFocused
            ? 'var(--color-surface)'
            : undefined,

      ':hover': {
        ...styles[':hover'],
        backgroundColor: isDisabled
          ? undefined
          : isSelected
            ? undefined
            : 'var(--color-surface)'
      },
      ':active': {
        ...styles[':active'],
        backgroundColor: !isDisabled ? 'var(--color-sand)' : undefined
      }
    };
  },
  indicatorSeparator: styles => ({
    ...styles,
    display: 'none'
  }),
  dropdownIndicator: (base, { isFocused }) => ({
    ...base,
    transform: isFocused ? 'rotate(180deg)' : undefined,
    transition: 'transform 0.3s',
    padding: '4px'
  }),
  input: styles => ({
    ...styles,
    color: 'var(--color-ink)',
    fontFamily: 'var(--font-body)',
    margin: 0,
    padding: 0
  }),
  placeholder: styles => ({
    ...styles,
    color: 'var(--color-muted)',
    fontFamily: 'var(--font-body)',
    fontSize: '0.82rem'
  }),
  singleValue: styles => ({
    ...styles,
    color: 'var(--color-ink)',
    fontFamily: 'var(--font-body)',
    fontSize: '0.82rem'
  })
});
