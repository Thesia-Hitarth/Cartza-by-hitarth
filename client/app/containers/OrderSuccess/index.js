import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react/dist/cjs/lucide-react.cjs';

import actions from '../../actions';
import { withRouter } from '../../utils/withRouter';

import NotFound from '../../components/Common/NotFound';
import LoadingIndicator from '../../components/Common/LoadingIndicator';

class OrderSuccess extends React.PureComponent {
  componentDidMount() {
    const id = this.props.match.params.id;
    this.props.fetchOrder(id);
  }

  componentDidUpdate(prevProps) {
    if (this.props.match.params.id !== prevProps.match.params.id) {
      const id = this.props.match.params.id;
      this.props.fetchOrder(id);
    }
  }

  render() {
    const { order, isLoading } = this.props;

    return (
      <div className='order-success-container d-flex align-items-center justify-content-center py-5'>
        {isLoading ? (
          <LoadingIndicator />
        ) : order._id ? (
          <div className='order-success-card text-center p-5'>
            <div className='success-checkmark-box mb-4 mx-auto'>
              <div className='checkmark-circle d-flex align-items-center justify-content-center'>
                <Check size={36} strokeWidth={3} className='checkmark-icon text-white' />
              </div>
            </div>
            <h2 className='success-heading mb-3'>Order Confirmed!</h2>
            <p className='success-subheading mb-4'>
              Thank you for your purchase. Your order{' '}
              <Link
                to={`/order/${order._id}?success`}
                state={{ prevPath: this.props.location.pathname }}
                className='order-id-link font-weight-bold'
              >
                #{order._id}
              </Link>{' '}
              is now complete.
            </p>
            <p className='success-email-notice mb-4'>A confirmation email with your order details will be sent to you shortly.</p>
            <div className='order-success-actions d-flex flex-column flex-sm-row justify-content-center gap-3'>
              <Link to='/dashboard/orders' className='ctz-btn ctz-btn--secondary ctz-btn--md text-center mb-2 mb-sm-0 mr-sm-2'>
                Track Your Order
              </Link>
              <Link to='/shop' className='ctz-btn ctz-btn--primary ctz-btn--md text-center'>
                Continue Shopping
              </Link>
            </div>
          </div>
        ) : (
          <NotFound message='No order found.' />
        )}
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    order: state.order.order,
    isLoading: state.order.isLoading
  };
};

export default withRouter(connect(mapStateToProps, actions)(OrderSuccess));
