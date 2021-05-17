import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import ReactGA from 'react-ga';
import { toast } from 'react-toastify';
import { withCookies } from 'react-cookie';
import upperFirst from 'lodash/upperFirst';
import isEmpty from 'lodash/isEmpty';
import { Col } from 'reactstrap';
import Tooltip from '../SharedComponents/Tooltip';
import Header from '../SharedComponents/Header';
import Footer from '../SharedComponents/MiniFooter';
import Loader from '../SharedComponents/Loader';
import updateStep from '../utils/cookie';
import shipper from '../assets/images/role-avatars/shipper.svg';
import forwarder from '../assets/images/role-avatars/forwarder.svg';
import customs from '../assets/images/role-avatars/customs.svg';
import port from '../assets/images/role-avatars/port.svg';
import config from '../config.json';
import { UserContext } from '../contexts/user.provider';
import { ProjectContext } from '../contexts/project.provider';

const images = { shipper, forwarder, customs, port }

const LoginPage = ({ cookies, history }) => {

  const [showLoader, setShowLoader] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const { storeCredentials, storeEvents } = useContext(UserContext);
  const { project, storeProjectSettings, storeEventMappings } = useContext(ProjectContext);

  useEffect(() => {
    const loadSettings = async () => {
      await storeProjectSettings();
      ReactGA.pageview('/login');
      storeEventMappings();
      const tourStep = cookies.get('tourStep');
      if (!tourStep) {
        cookies.set('tourStep', 0, { path: '/' });
      }
    }
    loadSettings();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loginAs = (event, role) => {
    event.preventDefault();
    setShowLoader(true);
    setSelectedRole(role);

    role === 'shipper' && updateStep(cookies, 1);
    role === 'forwarder' && updateStep(cookies, 12);
    role === 'customs' && updateStep(cookies, 16);
    role === 'port' && updateStep(cookies, 22);

    axios
      .post(`${config.rootURL}/login`, { username: role })
      .then(async response => {
        storeCredentials(response.data);
        await storeEvents(response.data.role);
        ReactGA.event({
          category: 'Login',
          action: `Logged in as ${role}`
        });

        history.push('/list');
      })
      .catch(error => {
        setShowLoader(false);
        setSelectedRole(null);
        toast.error(
          error.response && error.response.data && error.response.data.error
            ? error.response.data.error
            : 'Authentication error'
        );
      });
  };


  return (
    <React.Fragment>
      {
        isEmpty(project) ? <div /> :
          <div className="login-page">
            <Header ctaEnabled>
              <Col md={3} xl={4} className="heading hidden-md-down">
                <span className="heading-text">
                  Log in to your user role
            </span>
              </Col>
            </Header>
            <div className="cta-wrapper">
              <a className="button" href="https://www.youtube.com/watch?v=o5jX8VAyzUs" target="_blank" rel="noopener noreferrer">
                Need help? Watch the video
          </a>
            </div>
            <div className="roles-wrapper">
              {
                project.roles.map(role => (
                  <div className="role-wrapper" key={role.id}>
                    <div className="role-icon">
                      <img alt={role.name} src={images[role.id]} />
                    </div>
                    <div className="role-info">
                      <div className="role-name">
                        {upperFirst(role.id)}
                      </div>
                      <div className="role-description">
                        {role.description}
                      </div>
                      <div className="role-cta">
                        <button
                          className={`button ${role.id}-cta ${showLoader ? 'hidden' : ''}`}
                          onClick={event => loginAs(event, role.id)}
                        >
                          Log in
                    </button>
                        <Loader showLoader={showLoader && selectedRole === role.id} />
                      </div>
                    </div>
                  </div>
                ))
              }
            </div>
            <Footer />
            <Tooltip />
          </div>
      }
    </React.Fragment>

  );
}


export default withCookies(LoginPage);
