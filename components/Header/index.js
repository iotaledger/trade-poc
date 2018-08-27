import React, { Component } from 'react';

import Logo from '../Logo';
import '../../static/assets/scss/header.scss';
const logout = () => {}

class Header extends Component {
  logout = () => {
     // this.props.logout();
     // this.props.history.push('/login');
  };

  render() {
    return (
      <div className="header">
        <span className="header__logo"role="button" onClick={this.logout}>
          <Logo />
        </span>
        {this.props.children}
      </div>
    );
  }
}


export default Header;
