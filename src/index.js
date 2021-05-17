import 'react-app-polyfill/ie9';
import React from 'react';
import ReactDOM from 'react-dom';
import WebFontLoader from 'webfontloader';
import ReactGA from 'react-ga';
import Router from './Router';
import * as serviceWorker from './serviceWorker';
import './assets/scss/index.scss';
import UserProvider from './contexts/user.provider'
import ItemProvider from './contexts/item.provider';
import ItemsProvider from './contexts/items.provider';
import ProjectProvider from './contexts/project.provider';

WebFontLoader.load({
  google: {
    families: ['Nunito Sans:300,400,600,700', 'Material Icons'],
  },
});


ReactGA.initialize('UA-133441365-1'); // (trackingID, { debug: true })
ReactGA.set({ anonymizeIp: true });

let debug = false;

if (process.env.NODE_ENV === 'development') {
  debug = true
}

const renderApp = () => (
  <UserProvider debug={debug}>
    <ProjectProvider debug={debug}>
      <ItemsProvider debug={debug}>
        <ItemProvider debug={debug}>
          <Router />
        </ItemProvider>
      </ItemsProvider>
    </ProjectProvider>
  </UserProvider>
);

ReactDOM.render(renderApp(), document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
