import React from 'react';
import Tooltip from '../Tooltip';
import Popover from '../Popover';

const variantMap = {
  primary:   'ctz-btn--primary',
  secondary: 'ctz-btn--secondary',
  danger:    'ctz-btn--danger',
  ghost:     'ctz-btn--ghost',
  dark:      'ctz-btn--dark',
  link:      'ctz-btn--link',
  empty:     'ctz-btn--empty',
  none:      'ctz-btn--empty'
};
const sizeMap = { sm: 'ctz-btn--sm', md: 'ctz-btn--md', lg: 'ctz-btn--lg' };

const Button = ({
  id, variant = 'secondary', size = 'md', type = 'button',
  text, icon, iconDirection = 'left', iconClassName, disabled = false, loading = false,
  className = '', ariaLabel, ariaExpanded, role, tabIndex, onClick,
  round, borderless, fullWidth, tooltip, tooltipContent,
  popover, popoverContent, popoverTitle
}) => {
  const tooltipId = tooltip ? `tooltip-${id}` : id;
  const popoverId = popover ? `popover-${id}` : id;
  const btnId = tooltip ? tooltipId : popoverId;

  const classes = [
    'ctz-btn',
    variantMap[variant] || '',
    sizeMap[size] || 'ctz-btn--md',
    icon && text ? 'ctz-btn--with-icon' : '',
    icon && !text ? 'ctz-btn--icon-only' : '',
    loading ? 'ctz-btn--loading' : '',
    borderless ? 'ctz-btn--borderless' : '',
    fullWidth ? 'ctz-btn--full' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      id={btnId} type={type} disabled={disabled || loading}
      className={classes} aria-label={ariaLabel} aria-expanded={ariaExpanded}
      role={role} tabIndex={tabIndex} onClick={onClick}
      style={round ? { borderRadius: round } : undefined}
    >
      {tooltip && <Tooltip target={tooltipId}>{tooltipContent}</Tooltip>}
      {popover && <Popover target={popoverId} popoverTitle={popoverTitle}>{popoverContent}</Popover>}
      {loading && <span className='ctz-btn__spinner' aria-hidden='true' />}
      {!loading && iconDirection === 'left' && icon && (
        <span className={`ctz-btn__icon ${iconClassName || ''}`} aria-hidden='true'>{icon}</span>
      )}
      {text && <span className='ctz-btn__label'>{text}</span>}
      {!loading && iconDirection === 'right' && icon && (
        <span className={`ctz-btn__icon ctz-btn__icon--right ${iconClassName || ''}`} aria-hidden='true'>{icon}</span>
      )}
    </button>
  );
};

export default Button;
