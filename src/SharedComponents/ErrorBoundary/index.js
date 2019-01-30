import React, { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = {
    error: null
  };

  componentDidCatch(error) {
    this.setState({ error }, () => console.error(error));
  }

  render() {
    const { error } = this.state;
    if (error) {
      console.error(error.toString());
      return null;
    }
    return React.Children.map(this.props.children, child => {
      return React.cloneElement(child, {
        ...this.props,
      });
    });
  }
}
