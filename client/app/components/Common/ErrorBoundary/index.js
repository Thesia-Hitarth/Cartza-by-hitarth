import React from 'react';
import * as Sentry from '@sentry/react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error', error, errorInfo);
    Sentry.captureException(error, { extra: errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className='error-boundary-fallback d-flex flex-column align-items-center justify-content-center min-vh-100 text-center p-4'>
          <h2 className='text-danger mb-3'>Something went wrong.</h2>
          <p className='text-muted mb-4'>We&apos;re sorry for the inconvenience. Please try refreshing the page.</p>
          <button className='btn btn-primary' style={{ height: 48, minWidth: 160 }} onClick={() => window.location.reload()}>
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
