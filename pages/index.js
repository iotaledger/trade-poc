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
import Head from '../components/Head';
import config from '../config/config.json';
import Router from 'next/router'

//import '../static/assets/scss/loginPage.scss';

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
        <Head />
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
        <style jsx>{`

          @mixin button {
            letter-spacing: 1.5px;
            text-transform: uppercase;
            text-align: center;
            position: relative;
            cursor: pointer;
            overflow: hidden;
            white-space: nowrap;
            display: inline-block;
            color: #ffffff;
            background: linear-gradient(90deg,#18817c,#22b1ab);
          }


          .wrapper {
            display: flex;
            flex-direction: column;
          }

          .wrapper-graphic {
            width: 100%;
            position: relative;
          }

          .wrapper-graphic-background {
            display: none;
          }

          .wrapper-welcome {
            position: absolute;
            text-align: center;
            p {
              font-weight: 700;
              color: #ffffff;
              text-align: center;
            }
          }

          .wrapper-login {
            width: 100%;
            display: flex;
            justify-content: center;
            margin-top: 50px;

            .wrapper-login-form {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              max-width: 550px;
              min-width: 300px;
              width: 70%;

              .title {
                color: rgb(34,177,171);
                font-size: 40px;
                font-weight: 700;
                position: relative;
                margin-bottom: 15px;
                &:after {
                  content: "";
                  position: absolute;
                  bottom: -25px;
                  left: -30px;
                  right: -30px;
                  height: 5px;
                  background-image: -webkit-gradient(linear, 0 0, 100% 0, from(rgb(142, 210, 213)), to(rgb(124, 88, 182)));
                  background-image: -webkit-linear-gradient(left, rgb(142, 210, 213), rgb(124, 88, 182));
                  background-image: -moz-linear-gradient(left, rgb(142, 210, 213), rgb(124, 88, 182));
                  background-image: -o-linear-gradient(left, rgb(142, 210, 213), rgb(124, 88, 182));
                }
              }

              .form-button {
                @include button();
                width: 100%;
                margin-top: 60px;
                font-size: 22px;
                padding: 35px 50px;
                line-height: 2px;
                border-radius: 45px;
              }

              input {
                margin-top: 40px;
                font-size: 18px;
                font-weight: 700;
                padding-left: 10px;
              }
              .md-divider {
                background-color: rgb(151, 151, 151);
              }

              .md-floating-label {
                color: rgb(63, 63, 63);
                font-size: 18px;
                font-weight: 700;
                padding-left: 10px;
              }

              .md-layover {
                width: 100%;
                margin: 0;
                padding: 0;
                border-bottom: 1px solid rgb(151, 151, 151);
                margin-top: 100px;
                margin-bottom: 20px;

                .md-select-field--btn {
                  color: rgb(63, 63, 63);
                  font-size: 18px;
                  font-weight: 700;
                  padding-left: 10px;
                }

                .md-icon-separator {
                  padding-right: 0;
                }
              }

              .md-tile-content {
                .md-text {
                  color: rgb(63, 63, 63);
                  font-size: 18px;
                  font-weight: 700;
                }
              }

              .bouncing-loader.visible {
                position: relative;
                top: 55px;
              }
            }
          }

          @media (min-width: 769px) {
            .wrapper {
              display: flex;
              flex-direction: row;
            }

            .wrapper-graphic {
              width: 50%;

              .wrapper-welcome {
                top: 23%;
                width: 80%;

                svg {
                  width: 75%;
                  height: 160px;
                  margin-bottom: 15%;
                }

                p {
                  font-size: 36px;
                  width: 70%;
                  line-height: 50px;
                  margin-bottom: 40px;
                  margin: 0 auto 40px;
                }
              }
            }

            .wrapper-graphic-background.desktop {
              display: block;
              width: 100%;
              height: 100vh;
              position: relative;
            }

            .wrapper-login {
              width: 50%;
              margin-top: 0;

              .wrapper-login-form {
                width: 50%;

                .md-layover {
                  margin-top: 150px;
                  margin-bottom: 50px;
                }
              }
            }
          }

          @media (max-width: 768px) and (min-width: 501px) {
            .wrapper-graphic-background.tablet {
              display: block;
              width: 100%;
              position: relative;
            }

            .wrapper-graphic {
              .wrapper-welcome {
                top: 0%;
                width: 100%;

                svg {
                  width: 30%;
                  height: 100px;
                  margin: 5% auto 2%;
                }

                p {
                  font-size: 20px;
                  margin: 0 auto 20px;
                }
              }
            }
          }

          @media (max-width: 500px) {
            .wrapper-graphic-background.mobile {
              display: block;
              width: 100%;
              position: relative;
            }

            .wrapper-graphic {
              .wrapper-welcome {
                top: 0%;
                width: 100%;

                svg {
                  width: 50%;
                  height: 100px;
                  margin: 7% auto;
                }

                p {
                  font-size: 20px;
                  margin: 0 auto 20px;
                }
              }
            }
          }
        `}</style>
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
