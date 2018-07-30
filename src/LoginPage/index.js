import React, { Component } from 'react';
import axios from 'axios';
import { sha256 } from 'js-sha256';
import { connect } from 'react-redux';
import { TextField, SelectField, Button, FontIcon } from 'react-md';
import { toast } from 'react-toastify';
import { isEmpty, upperFirst } from 'lodash';
import { storeCredentials, storeEvents } from '../store/user/actions';
import { storeProjectSettings, storeEventMappings } from '../store/project/actions';
import Logo from '../SharedComponents/Logo';
import Loader from '../SharedComponents/Loader';
import Notification from '../SharedComponents/Notification';
import config from '../config.json';
import '../assets/scss/loginPage.scss';

class LoginPage extends Component {
  state = {
    showLoader: false,
  };

  componentDidMount() {
    this.props.loadProjectSettings();
    this.props.loadEventMappings();
  }

  login = event => {
    event.preventDefault();
    this.setState({ showLoader: true });
    if (!this.username.value) return;

    const username = this.props.project.roleUserMapping[this.username.value.toLowerCase()];
    const password = sha256(username.toLowerCase());

    axios
      .post(`${config.rootURL}/login`, { username, password })
      .then(response => {
        this.props.storeCredentials(response.data);
        this.props.storeEvents(response.data.role);
        this.props.history.push('/');
      })
      .catch(error => {
        this.setState({ showLoader: false });
        toast.error(
          error.response && error.response.data && error.response.data.error
            ? error.response.data.error
            : 'Authentication error'
        );
      });
  };

  render() {
    const { showLoader } = this.state;
    const {
      project: { roleUserMapping, projectName },
    } = this.props;
    if (isEmpty(roleUserMapping)) {
      return <div />;
    }
    const ROLES = Object.keys(roleUserMapping).map(role => upperFirst(role));

    return (
      <div className="wrapper">
        <div className="wrapper-graphic">
          <img src="desktop_bg.png" alt="background" className="wrapper-graphic-background desktop" />
          <img src="tablet_bg.png" alt="background" className="wrapper-graphic-background tablet" />
          <img src="mobile_bg.png" alt="background" className="wrapper-graphic-background mobile" />
          <div className="wrapper-welcome">
            <Logo />
            <p>Welcome back!</p>
            <p>Login to access {projectName}</p>
          </div>
        </div>
        <div className="wrapper-login">
          <form className="wrapper-login-form" onSubmit={this.login}>
            <h3 className="title">Login</h3>
            <SelectField
              ref={username => (this.username = username)}
              id="username"
              required
              simplifiedMenu
              className="md-cell"
              placeholder="Select role"
              menuItems={ROLES}
              position={SelectField.Positions.BELOW}
              dropdownIcon={<FontIcon>expand_more</FontIcon>}
            />
            <TextField
              ref={password => (this.password = password)}
              id="password"
              label="Enter password"
              type="password"
              required
            />
            <Loader showLoader={showLoader} />
            <Button raised onClick={this.login} className={`form-button ${showLoader ? 'hidden' : ''}`}>
              Login
            </Button>
            <Notification />
          </form>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  project: state.project,
});

const mapDispatchToProps = dispatch => ({
  loadProjectSettings: () => dispatch(storeProjectSettings()),
  loadEventMappings: () => dispatch(storeEventMappings()),
  storeCredentials: credentials => dispatch(storeCredentials(credentials)),
  storeEvents: role => dispatch(storeEvents(role)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LoginPage);
