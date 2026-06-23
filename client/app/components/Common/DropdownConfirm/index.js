/**
 *
 * DropdownConfirm
 *
 */

import React from 'react';

import { ChevronDown } from 'lucide-react/dist/cjs/lucide-react.cjs';

import {
  UncontrolledButtonDropdown,
  DropdownMenu,
  DropdownToggle
} from 'reactstrap';

const DropdownConfirm = props => {
  const { className, label, children } = props;

  return (
    <div className={`dropdown-confirm ${className}`}>
      <UncontrolledButtonDropdown>
        <DropdownToggle nav>
          <div className='dropdown-action sm'>
            {label}
            <ChevronDown size={14} className='dropdown-caret ml-1' style={{ verticalAlign: 'middle', display: 'inline-block' }} />
          </div>
        </DropdownToggle>
        <DropdownMenu right>{children}</DropdownMenu>
      </UncontrolledButtonDropdown>
    </div>
  );
};

DropdownConfirm.defaultProps = {
  label: ''
};

export default DropdownConfirm;
