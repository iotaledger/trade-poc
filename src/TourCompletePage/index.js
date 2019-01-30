import React, { Component } from 'react';
import ReactGA from 'react-ga';
import { Link } from 'react-router-dom';
import { Col, Row } from 'reactstrap';
import Header from '../SharedComponents/Header';
import Navigation from '../SharedComponents/Navigation';
import Footer from '../SharedComponents/Footer';

class IntroPage extends Component {
  componentDidMount() {
    ReactGA.pageview('/tour');
  }

  render() {
    return (
      <div className="tour-page">
        <Header className="background-transparent">
          <Navigation />
        </Header>
        <div className="heading-image end d-flex justify-content-center align-items-center">
          <div className="overlay d-flex flex-column">
            <div className="head-1">Congratulations</div>
            <div className="head-2">The shipment is on the way</div>
            <div className="sep">&nbsp;</div>
            <div className="sub-1">
              Data can continue to be reported for all supply chain actors to monitor: The shipping line can feed temperature data, the receiving port can confirm arrival, etc. until the goods reaches the retailer’s shelves.
            </div>
          </div>
        </div>
        <div className="content">
          <div className="extra-padding" id="tour">
            <Row>
              <Col xs={12}>
                <h2 className="d-flex justify-content-responsive">
                  Thank you for completing the tour
                </h2>
              </Col>
              <Col sm={{ size: 8, offset: 2 }} xs={12} className="d-flex flex-column justify-content-center">
                <p>
                  We have demonstrated how the Tangle can work as transaction layer between all actors to provide Single-Version-of-Truth on supply chain events and documents. Read and write access-rights can be managed by design and encryption added for security. IOTA’s Masked Authentication Messaging (MAM) protocol is a key IOTA differentiator to build and design supply chains solutions.
                </p>
              </Col>
            </Row>
          </div>
          <div className="alternate extra-padding" id="more">
            <Row>
              <Col sm={{ size: 8, offset: 2 }} xs={12}>
                <h2 className="d-flex justify-content-responsive">
                  Want more?
                </h2>
                <p className="bold">
                  Vision
               </p>
                <p>
                  <a target="_blank" rel="noopener noreferrer" href="https://www.iota.org/verticals/global-trade-supply-chains">See our short film</a> about our vision for the future of trade enabled by IOTA.
                </p>
                <p className="bold">
                  Technical
               </p>
                <p>
                  <a target="_blank" rel="noopener noreferrer" href="https://github.com/michelenati/IOTA-Blueprints/blob/master/IF-Blueprint-International_Trade_demo.pdf">See our Blueprint</a> for more information on how this was build and can be modified for bespoke solutions in your industry.
                </p>
                <p className="bold">
                  Context
               </p>
                <p>
                  Read our blogposts on about trade and supply chains: <a target="_blank" rel="noopener noreferrer" href="https://blog.iota.org/the-challenges-facing-todays-supply-chains-aaa9d3d9fc6d">The challenges facing today’s supply chains</a> & <a target="_blank" rel="noopener noreferrer" href="https://blog.iota.org/applying-iota-in-global-trade-and-supply-chains-mission-possible-32c659d69547">Applying IOTA in Global Trade and Supply Chains: Mission Possible.</a>
                </p>
                <p className="bold">
                  Play more
               </p>
                <p>
                  <Link to="/login">Log in</Link> and take the demo for a free spin.
                </p>
              </Col>
            </Row>
          </div>
          <div className="extra-padding" id="contact">
            <Row>
              <Col sm={{ size: 8, offset: 2 }} xs={12}>
                <h2 className="d-flex justify-content-responsive">
                  Contact
                </h2>
                <p className="justify-content-responsive">
                  If you want to discuss applications in internal trade and supply chains,<br />
                  contact Jens Munch Lund-Nielsen — <a href="mailto:jens@iota.org">Jens@iota.org</a>
                </p>
              </Col>
              <Col xs={12} className="d-flex justify-content-center">
                <a href="mailto:jens@iota.org" className="button intro-button">
                  Email
                </a>
              </Col>
            </Row>
          </div>
        </div>
        <Footer
          anchors={[
            { anchor: 'tour', text: 'Tour'},
            { anchor: 'more', text: 'Want more?'},
            { anchor: 'contact', text: 'Contact'},
          ]}
        />
      </div>
    );
  }
}

export default IntroPage;
