import React, { useEffect, useState } from 'react'
import ReactGA from 'react-ga';
import { withCookies } from 'react-cookie';

const Disclaimer = ({ cookies }) => {
  const [ack, setAck] = useState(true);


  useEffect(() => {
    const ack = cookies.get('ack');
    if (!ack) {
      document.body.classList.add('cookie-bar-top-bar');
      setAck(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const dismiss = () => {
    cookies.set('ack', true, { path: '/' });
    document.body.classList.remove('cookie-bar-top-bar');
    setAck(true);
  };

  return (
    <div>
      {
        ack ? null :
          <div className="disclaimer">
            <span className="disclaimer-text">
              This website uses cookies to ensure you get the best experience on our
              website.&nbsp;
            <ReactGA.OutboundLink
                className="disclaimer-link"
                eventLabel="https://www.iota.org/research/privacy-policy"
                to="https://www.iota.org/research/privacy-policy"
              >
                Learn more
            </ReactGA.OutboundLink>
            </span>
            <button className="button" onClick={dismiss}>Dismiss</button>
          </div>
      }
    </div>
  )

}

export default withCookies(Disclaimer)
