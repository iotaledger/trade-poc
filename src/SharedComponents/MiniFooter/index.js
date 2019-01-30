import React from 'react';
import { Col } from 'reactstrap';
import { Link } from 'react-router-dom';

export default ({ children }) => (
  <footer className="footer-mini">
    <Col xs={12} sm={4} xl={4} className="d-flex justify-content-start hidden-lg-down">
      <span>
        Email: <a href="mailto:contact@iota.org">contact@iota.org</a>
      </span>
    </Col>
    <Col xs={12} md={6} xl={4} className="d-flex justify-content-responsive">
      <span>
        <Link to="/tour">Liked the demo? Learn more about IOTA & Trade</Link>
      </span>
    </Col>
    <Col xs={12} md={6} xl={4} className="d-flex flex-column justify-content-end">
      <span className="hidden-xl-up">
        Email: <a href="mailto:contact@iota.org">contact@iota.org</a>
      </span>
      <span className="copyright">
        © 2018 <a href="https://iota.org">IOTA Foundation</a> — <a href="https://www.iota.org/research/privacy-policy">Privacy Policy</a>
      </span>
    </Col>
  </footer>
);
