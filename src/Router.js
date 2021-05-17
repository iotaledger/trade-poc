import React, { useContext, useEffect } from 'react';
import { CookiesProvider } from 'react-cookie';
import { HashRouter, Route } from 'react-router-dom';
import ListPage from './ListPage';
import DetailsPage from './DetailsPage';
import LoginPage from './LoginPage';
import CreateNewPage from './CreateNewPage';
import IntroPage from './IntroPage';
import TourCompletePage from './TourCompletePage';
import { initializeMamState } from './utils/mam';
import { ProjectContext } from './contexts/project.provider';

const Router = () => {

  const { project, storeProjectSettings } = useContext(ProjectContext);

  useEffect(() => {
    storeProjectSettings();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (project && project.provider) {
      initializeMamState(project.provider);
    }
  }, [project]);

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


export default Router;
