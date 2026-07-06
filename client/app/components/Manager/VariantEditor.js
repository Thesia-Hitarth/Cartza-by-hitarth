import React from 'react';
import { Row, Col, Table } from 'reactstrap';
import Input from '../Common/Input';
import Button from '../Common/Button';
import { Trash2, Plus } from 'lucide-react/dist/cjs/lucide-react.cjs';

const VariantEditor = ({ variants = [], onChange }) => {
  const handleAdd = () => {
    const newVariants = [
      ...variants,
      { color: 'Default', size: 'Default', quantity: 0, sku: '' }
    ];
    onChange(newVariants);
  };

  const handleRemove = index => {
    const newVariants = variants.filter((_, idx) => idx !== index);
    onChange(newVariants);
  };

  const handleFieldChange = (index, field, value) => {
    const newVariants = variants.map((v, idx) => {
      if (idx === index) {
        let updatedVal = value;
        if (field === 'quantity') {
          updatedVal = Number(value) || 0;
        }
        return { ...v, [field]: updatedVal };
      }
      return v;
    });
    onChange(newVariants);
  };

  const isDuplicate = (variant, index) => {
    if (!variant.color || !variant.size) return false;
    return variants.some((v, idx) => {
      if (idx === index) return false;
      return String(v.color).toLowerCase().trim() === String(variant.color).toLowerCase().trim() &&
             String(v.size).toLowerCase().trim() === String(variant.size).toLowerCase().trim();
    });
  };

  const hasDuplicates = variants.some((v, idx) => isDuplicate(v, idx));

  return (
    <div className='variant-editor my-4 p-3 border rounded shadow-sm bg-white'>
      <div className='d-flex align-items-center justify-content-between mb-3'>
        <h5 className='mb-0 text-dark font-weight-bold'>Product Variants</h5>
        <Button
          variant='primary'
          size='sm'
          text='Add Variant'
          icon={<Plus size={16} />}
          onClick={handleAdd}
        />
      </div>

      {hasDuplicates && (
        <div className='alert alert-danger py-2 px-3 mb-3 small font-weight-bold rounded'>
          ⚠️ Duplicate variant combinations (Color & Size) detected! Each combination must be unique.
        </div>
      )}

      {variants.length === 0 ? (
        <div className='text-center py-4 text-muted border rounded bg-light'>
          No variants defined. The product will use single stock quantity.
        </div>
      ) : (
        <Table responsive bordered hover className='mb-0 align-middle'>
          <thead className='thead-light'>
            <tr>
              <th>Color</th>
              <th>Size</th>
              <th>Quantity</th>
              <th>SKU</th>
              <th className='text-center' style={{ width: '80px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {variants.map((variant, index) => {
              const duplicate = isDuplicate(variant, index);
              const rowStyle = duplicate ? { backgroundColor: '#fff5f5' } : {};
              
              return (
                <tr key={index} style={rowStyle}>
                  <td style={{ minWidth: '120px' }}>
                    <input
                      type='text'
                      className={`form-control form-control-sm ${duplicate ? 'is-invalid' : ''}`}
                      placeholder='e.g. Red, Black'
                      value={variant.color || ''}
                      onChange={e => handleFieldChange(index, 'color', e.target.value)}
                    />
                  </td>
                  <td style={{ minWidth: '100px' }}>
                    <input
                      type='text'
                      className={`form-control form-control-sm ${duplicate ? 'is-invalid' : ''}`}
                      placeholder='e.g. M, L, XL'
                      value={variant.size || ''}
                      onChange={e => handleFieldChange(index, 'size', e.target.value)}
                    />
                  </td>
                  <td style={{ minWidth: '100px' }}>
                    <input
                      type='number'
                      className='form-control form-control-sm'
                      min='0'
                      placeholder='Quantity'
                      value={variant.quantity === undefined ? '' : variant.quantity}
                      onChange={e => handleFieldChange(index, 'quantity', e.target.value)}
                    />
                  </td>
                  <td style={{ minWidth: '150px' }}>
                    <input
                      type='text'
                      className='form-control form-control-sm'
                      placeholder='Variant SKU (Optional)'
                      value={variant.sku || ''}
                      onChange={e => handleFieldChange(index, 'sku', e.target.value)}
                    />
                  </td>
                  <td className='text-center'>
                    <Button
                      variant='danger'
                      size='sm'
                      borderless
                      icon={<Trash2 size={16} />}
                      onClick={() => handleRemove(index)}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default VariantEditor;
