import React, { useState } from 'react';
import Joyride from 'react-joyride';
import { withCookies } from 'react-cookie';
import _get from 'lodash/get';
import _last from 'lodash/last';
import ErrorBoundary from '../ErrorBoundary';
import tooltips_data from './tooltips';
import updateStep from '../../utils/cookie';
import close from '../../assets/images/tooltip-close.svg';



const Tooltip = ({ cookies, customTooltip, fetchComplete, activeTabIndex }) => {

  Tooltip.defaultProps = {
    customTooltip: null,
    fetchComplete: null,
    activeTabIndex: null
  }
  const [showMobileTooltip, setShowMobileTooltip] = useState(false);
  const [closeFn, setCloseFn] = useState(null);
  const [tooltips, setToolTips] = useState(tooltips_data.map(tooltip => ({ ...tooltip, disableBeacon: true })));

  const stepIndex = Number(cookies.get('tourStep') || 0);

  const callback = ({ action, index }) => {
    if (action === 'skip') {
      updateStep(cookies, index + 1);
    } else if (action === 'update') {
      setShowMobileTooltip(true);
    } else if (action === 'close') {
      const newTooltips = tooltips;
      delete newTooltips[index].disableBeacon;
      setToolTips(newTooltips);
      setShowMobileTooltip(false);
    }
  }

  const extractContent = element => {
    const last = _last(_get(element, 'props.children'));
    return _get(last, 'props.children');
  }

  const helpers = props => setCloseFn(props.close);

  const stopTour = () => {
    if (closeFn) {
      closeFn();
    }
    setShowMobileTooltip(false);
  }



  if (fetchComplete === false) {
    return null;
  }

  let run = true;
  if (stepIndex === 5 && activeTabIndex !== 1) {
    run = false;
  } else if (stepIndex === 8 && activeTabIndex !== 2) {
    run = false;
  } else if (stepIndex === 19 && activeTabIndex !== 3) {
    run = false;
  }

  let roundedBorder = false;
  if ([0, 1, 3, 4, 6, 7, 9, 11, 13, 15, 17, 18, 21, 23, 24, 25].includes(stepIndex)) {
    roundedBorder = true;
  }

  const spotlightStyles = {
    border: '2px solid #603f98',
    backgroundColor: 'transparent',
    borderRadius: roundedBorder ? '100vw' : '4px',
    boxShadow: 'unset'
  }

  return (
    <React.Fragment>
      {
        showMobileTooltip ? (
          <div className="mobile-tooltip" role="button" onClick={stopTour}>
            <div className="tooltip-content">
              <span className="tooltip-step">
                Step {stepIndex + 1}
              </span>
              <span className="tooltip-action">
                {extractContent(tooltips[stepIndex].content)}
              </span>
            </div>
            <img alt="close" src={close} className="tooltip-close" />
          </div>
        ) : null
      }
      <ErrorBoundary>
        <Joyride
          steps={customTooltip || tooltips}
          stepIndex={!customTooltip ? stepIndex : null}
          callback={callback}
          getHelpers={helpers}
          hideBackButton
          showSkipButton={stepIndex === 8}
          spotlightClicks
          run={run}
          disableOverlay={stepIndex === 3 || stepIndex === 8}
          styles={{
            options: {
              overlayColor: 'transparent',
              primaryColor: '#603f98',
              textColor: '#3f3f3f',
              zIndex: 1000,
            },
            overlay: {
              mixBlendMode: 'normal'
            },
            overlayLegacy: {
              mixBlendMode: 'normal'
            },
            spotlight: {
              ...spotlightStyles
            },
            spotlightLegacy: {
              ...spotlightStyles
            }
          }}
          floaterProps={{
            wrapperOptions: {
              offset: -22,
              placement: 'top',
              position: true,
            }
          }}
        />
      </ErrorBoundary>
    </React.Fragment>
  )
}

export default withCookies(Tooltip);
