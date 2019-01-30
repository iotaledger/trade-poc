import ReactGA from 'react-ga';

const updateStep = (cookies, step) => {
  if (Number(cookies.get('tourStep')) === (step - 1)) {
    cookies.set('tourStep', step, { path: '/' });
    ReactGA.event({
      category: 'Tour',
      action: `Completed step ${step - 1}`
    });
  }
}

export default updateStep;
