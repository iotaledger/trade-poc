import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { logout } from '../../store/user/actions';
import Logo from '../Logo';
// import '../../assets/scss/header.scss';

class Header extends Component {
  logout = () => {
    this.props.logout();
    this.props.history.push('/login');
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

const mapDispatchToProps = dispatch => ({
  logout: () => dispatch(logout()),
});

export default connect(
  null,
  mapDispatchToProps
)(withRouter(Header));
