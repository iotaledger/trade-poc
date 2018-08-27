import React, { Component } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types'; // ES6
import { sha256 } from 'js-sha256';
import { TextField, SelectField, Button, FontIcon } from 'react-md';
import { toast } from 'react-toastify';
import { isEmpty, upperFirst } from 'lodash';
import Logo from '../components/Logo';
import Loader from '../components/Loader';
import Notification from '../components/Notification';
import config from '../config/config.json';
import Router from 'next/router'

import '../static/assets/scss/loginPage.scss';

class LoginPage extends Component {
  constructor(props) {
    super(props)
    this.state = {
      showLoader: false,
      username: '',
      password: ''
    };
    this.login = this.login.bind(this)
    this.onTextChange = this.onTextChange.bind(this)
  }

  componentDidMount() {
    // this.props.loadProjectSettings();
    // this.props.loadEventMappings();
  }

  onTextChange({ username, password }, e) {
      if (e.target.id === 'username') {
        this.setState({username})
      }
      if (e.target.id === 'password') {
        this.setState({password})
      }
  }

  login(event) {
  //  event.preventDefault();
    this.setState({ showLoader: true });
    /*
      if (!this.username.value) return;
    */
    const username = this.state.username;
  //  const password = sha256(username.toLowerCase());
    const password = this.state.password;

    axios
      .post(`/api/login`, { username, password })
      .then(response => {
      //  this.props.storeCredentials(response.data);
      //  this.props.storeEvents(response.data.role);
      //  this.props.history.push('/');
        this.setState({ showLoader: false });
        if(response.data.username) {
          // redic to List
          Router.push('/list')

        } else {
            alert('auth failed')
        }
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

    return (
      <div className="wrapper">
        <div className="wrapper-graphic">
          <img src="static/images/desktop_bg.png" alt="background" className="wrapper-graphic-background desktop" />
          <img src="static/images/tablet_bg.png" alt="background" className="wrapper-graphic-background tablet" />
          <img src="static/images/mobile_bg.png" alt="background" className="wrapper-graphic-background mobile" />
          <div className="wrapper-welcome">
            <Logo />
            <p>Welcome back!</p>
            <p>Login to access {projectName}</p>
          </div>
        </div>
        <div className="wrapper-login">
          <form className="wrapper-login-form">
          <h3 className="title">Login</h3>
            <TextField
              id="username"
              label="Username"
              type="text"
              value={this.state.username}
              onChange={(username, e) => this.onTextChange({ username }, e)}
              required
            />
            <TextField
              id="password"
              label="Password"
              type="password"
              value={this.state.password}
              onChange={(password, e) => this.onTextChange({ password }, e)}
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

LoginPage.propTypes = {
  project: PropTypes.object
};

LoginPage.defaultProps = {
  project: {
    roleUserMapping : ['Stranger', 'Stranger2']
  }
};


/*
const mapStateToProps = state => ({
  project: state.project,
});

const mapDispatchToProps = dispatch => ({
  loadProjectSettings: () => dispatch(storeProjectSettings()),
  loadEventMappings: () => dispatch(storeEventMappings()),
  storeCredentials: credentials => dispatch(storeCredentials(credentials)),
  storeEvents: role => dispatch(storeEvents(role)),
});*/

export default LoginPage;
