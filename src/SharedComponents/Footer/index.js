import React from 'react';
import { Col, Row } from 'reactstrap';

const Footer = ({ anchors }) => {

  const onAnchorClick = (event, anchor) => {
    event.preventDefault();
    const target = document.querySelector(`#${anchor}`);
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

    return (
      <footer>
        <Row>
          <Col>
            <div className="footer-heading">This Site</div>
            {
              anchors.map(({ anchor, text }) =>
                <a
                  href="/"
                  key={anchor}
                  className="anchor"
                  tabIndex="1"
                  onClick={e => onAnchorClick(e, anchor)}
                >{text}</a>
              )
            }
          </Col>
          <Col>
            <div className="footer-heading">The Foundation</div>
            <a href="https://www.iota.org/the-foundation/our-vision">Our Vision</a><br />
            <a href="https://www.iota.org/the-foundation/the-iota-foundation">The IOTA Foundation</a><br />
            <a href="https://www.iota.org/the-foundation/team">Meet the Team</a><br />
            <a href="https://www.iota.org/the-foundation/work-at-the-iota-foundation">Work at the IOTA Foundation</a>
          </Col>
          <Col>
            <div className="footer-heading">Verticals</div>
            <a href="https://www.iota.org/verticals/mobility-automotive">Mobility &amp; Automotive</a><br />
            <a href="https://www.iota.org/verticals/global-trade-supply-chains">Global Trade &amp; Supply Chains</a><br />
            <a href="https://www.iota.org/verticals/ehealth">eHealth</a><br />
            <a href="https://www.iota.org/verticals/smart-energy">Smart Energy</a>
          </Col>
          <Col>
            <div className="footer-heading">Research</div>
            <a href="https://www.iota.org/research/meet-the-tangle">Meet the Tangle</a><br />
            <a href="https://www.iota.org/research/academic-papers">Academic Papers</a><br />
            <a href="https://www.iota.org/research/roadmap">Research &amp; Development Roadmap</a>
          </Col>
        </Row>
        <Row>
          <Col className="footer-text-info">
            IOTA Foundation<br />
            c/o Nextland<br />
            Strassburgerstraße 55<br />
            10405 Berlin<br />
            Germany
          </Col>
          <Col className="footer-text-info">
            &copy; 2018 IOTA Foundation - Privacy Policy<br />
            Email: contact@iota.org<br />
            Board of Directors: Dominik Schiener, Serguei Popov &amp; Navin Ramachandran<br />
            ID/Company No.: 3416/1234/2<br />
            EU public ID number in the EU Transparency Register:
            500027331119-04
          </Col>
        </Row>
      </footer>
    );
}

export default Footer;
