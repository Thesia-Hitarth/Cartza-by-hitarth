/**
 *
 * OrderDetails
 *
 */

import React from 'react';
import { Row, Col } from 'reactstrap';

import OrderMeta from '../OrderMeta';
import OrderItems from '../OrderItems';
import OrderSummary from '../OrderSummary';

const OrderTimeline = ({ status }) => {
  const steps = [
    { label: 'Placed', key: 'Not_processed', icon: '🛒' },
    { label: 'Processing', key: 'Processing', icon: '⚙️' },
    { label: 'Shipped', key: 'Shipped', icon: '🚚' },
    { label: 'Delivered', key: 'Delivered', icon: '🎁' }
  ];

  const getStatusIndex = (s) => {
    if (s === 'Cancelled') return -1;
    if (s === 'Not_processed') return 0;
    if (s === 'Processing') return 1;
    if (s === 'Shipped') return 2;
    if (s === 'Delivered') return 3;
    return 0;
  };

  const currentIndex = getStatusIndex(status);

  if (status === 'Cancelled') {
    return (
      <div className='tw-bg-red/10 tw-border tw-border-red tw-p-4 tw-rounded-lg tw-mb-5 tw-flex tw-items-center tw-gap-3'>
        <span className='tw-text-2xl'>❌</span>
        <div>
          <h4 className='tw-text-red tw-font-semibold tw-m-0'>Order Cancelled</h4>
          <p className='tw-text-sm tw-m-0 tw-opacity-80'>This order has been cancelled and cannot be tracked.</p>
        </div>
      </div>
    );
  }

  return (
    <div className='tw-bg-surface tw-border tw-border-border tw-p-6 tw-rounded-lg tw-mb-5 tw-font-body'>
      <h4 className='tw-text-base tw-font-semibold tw-mb-6 text-dark'>Order Tracking Timeline</h4>
      <div className='tw-flex tw-flex-col md:tw-flex-row tw-justify-between tw-items-center tw-relative tw-gap-8 md:tw-gap-0'>
        {steps.map((step, idx) => {
          const isCompleted = idx <= currentIndex;
          const isCurrent = idx === currentIndex;
          
          return (
            <div key={step.key} className='tw-flex tw-flex-col tw-items-center tw-flex-1 tw-relative tw-z-10'>
              {/* Connector line */}
              {idx < steps.length - 1 && (
                <div className='tw-hidden md:tw-block tw-absolute tw-left-1/2 tw-top-5 tw-w-full tw-h-0.5 tw-bg-border tw-z-0'>
                  <div 
                    className='tw-h-full tw-bg-success tw-transition-all tw-duration-slow'
                    style={{ width: idx < currentIndex ? '100%' : '0%' }}
                  />
                </div>
              )}

              {/* Step Circle */}
              <div className={`
                tw-w-10 tw-h-10 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-text-lg
                tw-border-2 tw-transition-all tw-duration-base tw-z-10
                ${isCompleted ? 'tw-bg-success tw-border-success tw-text-white' : 'tw-bg-cream tw-border-border tw-text-muted'}
                ${isCurrent ? 'tw-ring-4 tw-ring-success/20' : ''}
              `}>
                {step.icon}
              </div>

              <div className='tw-mt-3 tw-text-center'>
                <span className={`tw-text-sm tw-font-medium ${isCompleted ? 'tw-text-ink' : 'tw-text-muted'}`}>
                  {step.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const OrderDetails = props => {
  const { order, user, cancelOrder, updateOrderItemStatus, onBack } = props;
  return (
    <div className='order-details'>
      <Row>
        <Col xs='12' md='12'>
          <OrderMeta order={order} cancelOrder={cancelOrder} onBack={onBack} />
        </Col>
      </Row>

      <Row className='mt-3'>
        <Col xs='12'>
          <OrderTimeline status={order.status} />
        </Col>
      </Row>

      <Row className='mt-3'>
        <Col xs='12' lg='8'>
          <OrderItems
            order={order}
            user={user}
            updateOrderItemStatus={updateOrderItemStatus}
          />
        </Col>
        <Col xs='12' lg='4' className='mt-5 mt-lg-0'>
          <OrderSummary order={order} />
        </Col>
      </Row>
    </div>
  );
};

export default OrderDetails;
