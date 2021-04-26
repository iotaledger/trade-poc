import 'react-app-polyfill/ie9';
import React from 'react';
import ReactDOM from 'react-dom';
import WebFontLoader from 'webfontloader';
import ReactGA from 'react-ga';
import { Provider } from 'react-redux';
import Router from './Router';
import * as serviceWorker from './serviceWorker';
import configureStore from './store/configure';
import './assets/scss/index.scss';

WebFontLoader.load({
  google: {
    families: ['Nunito Sans:300,400,600,700', 'Material Icons'],
  },
});

const store = configureStore();

ReactGA.initialize('UA-133441365-1'); // (trackingID, { debug: true })
ReactGA.set({ anonymizeIp: true });

const renderApp = () => (
  <Provider store={store}>
    <Router />
  </Provider>
);

ReactDOM.render(renderApp(), document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
