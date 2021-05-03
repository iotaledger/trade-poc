import React, { useEffect } from 'react';
import ReactGA from 'react-ga';
import { Link } from 'react-router-dom';
import { Col, Row } from 'reactstrap';
import Header from '../SharedComponents/Header';
import Navigation from '../SharedComponents/Navigation';
import Footer from '../SharedComponents/Footer';
import useCasesPlaceholder from '../assets/images/intro/use-cases-placeholder.png';

const IntroPage = () => {

  useEffect(() => {
    ReactGA.pageview('/intro');
  }, [])

  return (
    <div className="intro-page">
      <Header className="background-transparent">
        <Navigation />
      </Header>
      <div className="heading-image d-flex justify-content-center align-items-center">
        <div className="overlay d-flex flex-column">
          <div className="head-1">How IOTA is</div>
          <div className="head-2">Revolutionizing International Trade</div>
          <div className="sep">&nbsp;</div>
          <div className="sub-1">
            Today’s trade is still based on paper documents and antiquated processes.<br />IOTA is set to radically transform international trade and supply chains,<br />improving visibility, control and reducing overheads.
            </div>
          <Link to="/login" className="button intro-button">
            Try the demo
            </Link>
        </div>
      </div>
      <div className="content">
        <div className="extra-padding" id="problem">
          <Row>
            <Col xs={12}>
              <h2 className="d-flex justify-content-responsive">
                The global problem
                </h2>
            </Col>
            <Col xs={12} sm={6} className="d-flex flex-column justify-content-center">
              <h1 className="text-responsive-align">
                Slow and little trust in information shared
                </h1>
              <p className="text-responsive-align">
                Global trade and supply chains are highly complex and involve many actors – both public and private.<br /><br />Information is pushed from actors to actor, re-keyed into new systems with loss of data integrity and authenticity. Emails, phone calls and uncertainty are the daily details of moving goods.
                </p>
            </Col>
            <Col xs={12} sm={6} className="d-flex flex-column justify-content-center">
              <img
                className="img-fluid use-cases-1"
                src={useCasesPlaceholder}
                alt="Use Cases 1"
              />
            </Col>
            <Col
              xs={12}
              sm={6}
              className="d-flex flex-column justify-content-center hidden-xs-down"
            >
              <img
                className="img-fluid use-cases-2"
                src={useCasesPlaceholder}
                alt="Use Cases 2"
              />
            </Col>
            <Col xs={12} sm={6} className="d-flex flex-column justify-content-center">
              <h1 className="text-responsive-align-alt">
                Leads to high costs and in-efficiencies
                </h1>
              <p className="text-responsive-align-alt">
                As a result, shipping suffers from daily problems such as containers and trucks standing idle, cash flow tied up in goods waiting in ports, delays and a costly lack of coordination.<br /><br />Frequently documents go missing with limited indication of location, visibility of inventory or cargo status.<br /><br />The existing paper process used as a basis for the shipping economy only serves to slow down international trade.
                </p>
            </Col>
            <Col
              xs={12}
              sm={6}
              className="d-flex flex-column justify-content-center hidden-sm-up"
            >
              <img
                className="img-fluid use-cases-2"
                src={useCasesPlaceholder}
                alt="Use Cases 2"
              />
            </Col>
          </Row>
        </div>
        <div className="alternate extra-padding" id="solution">
          <Row>
            <Col xs={12}>
              <h2 className="d-flex justify-content-responsive">
                The IOTA solution
                </h2>
            </Col>
            <Col xs={12} sm={6} className="d-flex flex-column justify-content-center">
              <h1 className="text-responsive-align">
                The Ledger provides Single-Version-of-Truth
                </h1>
              <p className="text-responsive-align">
                Tomorrow’s supply chain is supported by a distributed ledger where original documents and events are reported in real time and made available to authorized actors. It will provide transparency to the process and allow everyone to piggy-back on the original data.<br /><br />New blockchain solutions have emerged to tackle supply chains challenges. However, these technologies were not created to handle the scale of international trade and transaction fees can quickly become costly.
                </p>
            </Col>
            <Col xs={12} sm={6} className="d-flex flex-column justify-content-center">
              <img
                className="img-fluid use-cases-3"
                src={useCasesPlaceholder}
                alt="Use Cases 3"
              />
            </Col>
            <Col
              xs={12}
              sm={6}
              className="d-flex flex-column justify-content-center hidden-xs-down"
            >
              <img
                className="img-fluid use-cases-4"
                src={useCasesPlaceholder}
                alt="Use Cases 4"
              />
            </Col>
            <Col xs={12} sm={6} className="d-flex flex-column justify-content-center">
              <h1 className="text-responsive-align-alt">
                IOTA provides security, integrity and scale-ability
                </h1>
              <p className="text-responsive-align-alt">
                IOTA Tangle is perfectly suited for this role as it scales with demand and feeless transactions were formed as a fundamental basis of the technology.<br /><br />Additionally, Zero-value transactions can be used to secure integrity of exchanged data privately and immutably using the unique IOTA Masked Authenticated Message (MAM) protocol.<br /><br />To understand how this will revolutionise and reshape trade and supply chain systems, follow the journey of a container in our interactive demo.
                </p>
            </Col>
            <Col
              xs={12}
              sm={6}
              className="d-flex flex-column justify-content-center hidden-sm-up"
            >
              <img
                className="img-fluid use-cases-4"
                src={useCasesPlaceholder}
                alt="Use Cases 4"
              />
            </Col>
          </Row>
        </div>
        <div className="extra-padding" id="tryit">
          <Row>
            <Col sm={{ size: 8, offset: 2 }} xs={12}>
              <h2 className="d-flex justify-content-responsive">
                Follow the journey of a shipping container
                </h2>
              <p className="d-flex justify-content-responsive">
                Using live transactions on the IOTA Tangle, learn how different actors can have different access privileges<br />(read/write) to shipping documents along the supply chain.
                </p>
              <p className="d-flex justify-content-responsive">
                All events and data are stored securely with integrity from the IOTA Tangle that completely secures their authenticity, entirely without fees.
                </p>
            </Col>
            <Col xs={12} className="d-flex justify-content-center">
              <Link to="/login" className="button intro-button">
                Try the demo
                </Link>
            </Col>
          </Row>
        </div>
      </div>
      <Footer
        anchors={[
          { anchor: 'problem', text: 'The global problem' },
          { anchor: 'solution', text: 'The IOTA solution' },
          { anchor: 'tryit', text: 'Try the demo' },
        ]}
      />
    </div>
  );

}

export default IntroPage;
