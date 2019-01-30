import React from 'react';
import { Provider } from 'react-redux';
import { CookiesProvider } from 'react-cookie';
import { HashRouter, Route } from 'react-router-dom';
import configureStore from './store/configure';
import ListPage from './ListPage';
import DetailsPage from './DetailsPage';
import LoginPage from './LoginPage';
import CreateNewPage from './CreateNewPage';
import IntroPage from './IntroPage';
import TourCompletePage from './TourCompletePage';

const store = configureStore();

const Router = () => (
  <CookiesProvider>
    <Provider store={store}>
      <HashRouter>
        <div>
          <Route path="/" component={IntroPage} exact />
          <Route path="/tour" component={TourCompletePage} />
          <Route path="/list" component={ListPage} />
          <Route path="/login" component={LoginPage} />
          <Route path="/new" component={CreateNewPage} />
          <Route path="/details/:containerId" component={DetailsPage} />
        </div>
      </HashRouter>
    </Provider>
  </CookiesProvider>
);

export default Router;
