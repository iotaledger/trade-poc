import React, { Component } from 'react';
import { connect } from 'react-redux';
import { CookiesProvider } from 'react-cookie';
import { HashRouter, Route } from 'react-router-dom';
import ListPage from './ListPage';
import DetailsPage from './DetailsPage';
import LoginPage from './LoginPage';
import CreateNewPage from './CreateNewPage';
import IntroPage from './IntroPage';
import TourCompletePage from './TourCompletePage';
import { storeProjectSettings } from './store/project/actions';
import { initializeMamState } from './utils/mam';

class Router extends Component {
  componentDidMount() {
    this.props.storeProjectSettings();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.project && nextProps.project.provider) {
      initializeMamState(nextProps.project.provider);
    }
  }

  render() {
    return (
      <CookiesProvider>
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
      </CookiesProvider>
    );
  }
}

const mapStateToProps = state => ({ project: state.project });

const mapDispatchToProps = dispatch => ({
  storeProjectSettings: () => dispatch(storeProjectSettings()),
});

export default connect(mapStateToProps, mapDispatchToProps)(Router);
