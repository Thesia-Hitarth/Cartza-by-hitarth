/**
 *
 * Newsletter
 *
 */

import React from 'react';
import { connect } from 'react-redux';

import actions from '../../actions';

class Newsletter extends React.PureComponent {
  render() {
    const { email, newsletterChange, subscribeToNewsletter, formErrors } = this.props;

    const handleSubmit = event => {
      event.preventDefault();
      subscribeToNewsletter();
    };

    return (
      <div className='newsletter-form-redesign text-center py-2'>
        <h2 className='newsletter-headline mb-3'>Get the Best Deals First.</h2>
        
        <form onSubmit={handleSubmit} className='newsletter-submit-form mx-auto'>
          <div className='newsletter-input-row d-flex align-items-center'>
            <input
              type='email'
              name='email'
              className='newsletter-input'
              placeholder='Enter your email address'
              value={email}
              onChange={e => newsletterChange('email', e.target.value)}
              required
            />
            <button type='submit' className='btn-newsletter-subscribe'>
              Subscribe
            </button>
          </div>
        </form>
        {formErrors['email'] && (
          <p className='text-danger mt-2 font-weight-500' style={{ fontSize: '13px' }}>
            {formErrors['email']}
          </p>
        )}
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    email: state.newsletter.email,
    formErrors: state.newsletter.formErrors
  };
};

export default connect(mapStateToProps, actions)(Newsletter);
