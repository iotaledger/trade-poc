import React, { useContext } from 'react';
import ReactGA from 'react-ga';
import { withRouter } from 'react-router';
import { withCookies } from 'react-cookie';
import { Link } from 'react-router-dom';
import { Col, Row } from 'reactstrap';
import isEmpty from 'lodash/isEmpty';
import upperFirst from 'lodash/upperFirst';
import Disclaimer from '../Disclaimer';
import updateStep from '../../utils/cookie';
import logoWhiteHorizontal from '../../assets/images/iota-horizontal-white.svg';
import { UserContext } from '../../contexts/user.provider';
import { ProjectContext } from '../../contexts/project.provider';

const CallToAction = ({ user, logout, reset }) => {

  return (
    <Col xs={6} lg={5} xl={4} className="cta">
      <div className="header-cta-wrapper">
        <Row>
          <Col xs={5} className="hidden-sm-down">
            <h4>
              User Role
          </h4>
            {
              !isEmpty(user) ? (
                <span>
                  {upperFirst(user.role)}
                </span>
              ) : (
                <span>
                  Logged out
                </span>
              )
            }
          </Col>
          <Col xs={7} className="button-wrapper">
            {
              !isEmpty(user) ? (
                <button className="button primary logout-cta" onClick={logout}>
                  Log out
                </button>
              ) : (
                <button className="button secondary reset-cta" onClick={reset}>
                  Reset demo
                </button>
              )
            }
          </Col>
        </Row>
      </div>
    </Col>
  );
}

const Header = ({cookies, history, children, className, ctaEnabled = false}) => {

  const { user, logout } = useContext(UserContext);
  const { reset } = useContext(ProjectContext)

  const logoutUser = () => {
    logout();
    updateStep(cookies, 11);
    updateStep(cookies, 15);
    updateStep(cookies, 21);

    ReactGA.event({
      category: 'Logout',
      action: `Logout from ${user.role}`
    });

    if (Number(cookies.get('tourStep')) === 26) {
      ReactGA.event({
        category: 'Tour',
        action: 'Tour completed',
        label: `Container ID ${cookies.get('containerId')}`
      });

      cookies.remove('tourStep');
      cookies.remove('containerId');

      history.push('/tour');
    } else {
      history.push('/login');
    }
  };

  const resetApplication = () => {

    let containerIdString = ''
    if (cookies.get('containerId')) {
      containerIdString = `Container ID ${cookies.get('containerId')}`;
    }
    ReactGA.event({
      category: 'Reset',
      action: 'Reset tour',
      label: containerIdString,
      value: Number(cookies.get('tourStep'))
    });

    cookies.remove('tourStep');
    cookies.remove('containerId');
    reset();
    window.location.reload();
  };

  return (
    <React.Fragment>
      <Disclaimer />
      <header className={className}>
        <Row>
          <Col xs={12} className="d-flex justify-content-between align-items-start">
            <Col xs={4}>
              <Link to="/">
                <img className="logo" src={logoWhiteHorizontal} alt="IOTA" />
              </Link>
            </Col>
            {children}
            {ctaEnabled ? <CallToAction logout={logoutUser} reset={resetApplication} user={user} /> : null}
          </Col>
        </Row>
      </header>
    </React.Fragment>
  );
};

export default withRouter(withCookies(Header));
