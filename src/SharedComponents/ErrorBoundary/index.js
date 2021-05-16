import React, { useState } from 'react';

const ErrorBoundary = (props) => {

  const [error, setError] = useState(null);

  if (error) {
    return (null);
  }
  try {
    return React.Children.map(props.children, child => {
      return (React.cloneElement(child, {
        ...props,
      }));
    });
  } catch (e) {
    setError(e);
    console.error("Error in Boundary: ", e.toString());
    return (null);
  }

}

export default ErrorBoundary
