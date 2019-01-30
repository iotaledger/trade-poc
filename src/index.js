import 'react-app-polyfill/ie9';
import React from 'react';
import ReactDOM from 'react-dom';
import WebFontLoader from 'webfontloader';
import ReactGA from 'react-ga';
import Router from './Router';
import * as serviceWorker from './serviceWorker';
import { initializeFirebaseApp } from './utils/firebase';
import './assets/scss/index.scss';
import { trackingID } from './config.json';

WebFontLoader.load({
  google: {
    families: ['Nunito Sans:300,400,600,700', 'Material Icons'],
  },
});

initializeFirebaseApp();

ReactGA.initialize(trackingID); // (trackingID, { debug: true })
ReactGA.set({ anonymizeIp: true });

ReactDOM.render(<Router />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
