
import { error } from 'react-notification-system-redux';

import { signOut } from '../containers/Login/actions';

const handleError = (err, dispatch, title = '') => {
  const unsuccessfulOptions = {
    title: `${title}`,
    message: ``,
    position: 'tr',
    autoDismiss: 4
  };

  if (err.response) {
    if (err.response.status === 400) {
      unsuccessfulOptions.title = title ? title : 'Please Try Again!';
      unsuccessfulOptions.message = err.response.data.error;
      dispatch(error(unsuccessfulOptions));
    } else if (err.response.status === 404) {
      unsuccessfulOptions.title = title ? title : 'Not Found';
      unsuccessfulOptions.message =
        err.response.data?.message ||
        err.response.data?.error ||
        'The requested resource could not be found. Please try again.';
      dispatch(error(unsuccessfulOptions));
    } else if (err.response.status === 401) {
      unsuccessfulOptions.message = 'Unauthorized Access! Please login again';
      dispatch(signOut());
      dispatch(error(unsuccessfulOptions));
    } else if (err.response.status === 403) {
      unsuccessfulOptions.message =
        'Forbidden! You are not allowed to access this resource.';
      dispatch(error(unsuccessfulOptions));
    } else if (err.response.status >= 500) {
      unsuccessfulOptions.title = 'Server Error';
      unsuccessfulOptions.message =
        'Something went wrong on our end. Please try again shortly.';
      dispatch(error(unsuccessfulOptions));
    }
  } else if (err.message) {
    unsuccessfulOptions.message = err.message;
    dispatch(error(unsuccessfulOptions));
  } else {
    unsuccessfulOptions.title = 'Connection Error';
    unsuccessfulOptions.message =
      'Unable to reach the server. Please check your connection and try again.';
    dispatch(error(unsuccessfulOptions));
  }
};

export default handleError;
