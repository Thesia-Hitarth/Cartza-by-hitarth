import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

export function withRouter(Component) {
  function ComponentWithRouterProp(props) {
    const location = useLocation();
    const navigate = useNavigate();
    const params = useParams();

    const history = {
      push: (to) => navigate(to),
      replace: (to) => navigate(to, { replace: true }),
      goBack: () => navigate(-1),
      location
    };

    const match = {
      params,
      isExact: true,
      path: location.pathname,
      url: location.pathname
    };

    return (
      <Component
        {...props}
        location={location}
        history={history}
        match={match}
      />
    );
  }

  return ComponentWithRouterProp;
}
