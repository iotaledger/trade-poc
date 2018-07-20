import React from 'react';
import { Provider } from 'react-redux';
import { Switch, Route } from 'react-router-dom';
import configureStore from './store/configure';
import ListPage from './ListPage';
import DetailsPage from './DetailsPage';
import LoginPage from './LoginPage';
import CreateNewPage from './CreateNewPage';

const store = configureStore();

const Router = () => (
  <Provider store={store}>
    <Switch>
      <Route path="/" component={ListPage} exact />
      <Route path="/details/:itemId" component={DetailsPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/new" component={CreateNewPage} />
      <Route component={ListPage} />
    </Switch>
  </Provider>
);

export default Router;
