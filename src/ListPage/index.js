import React, { useContext, useEffect, useRef, useState } from 'react';
import ReactGA from 'react-ga';
import { toast } from 'react-toastify';
import { Col } from 'reactstrap';
import { withCookies } from 'react-cookie';
import classNames from 'classnames';
import { DataTable, TableHeader, TableBody, TableRow, TableColumn } from 'react-md';
import isEmpty from 'lodash/isEmpty';
import updateStep from '../utils/cookie';
import Tooltip from '../SharedComponents/Tooltip';
import Loader from '../SharedComponents/Loader';
import Header from '../SharedComponents/Header';
import Footer from '../SharedComponents/MiniFooter';
import Notification from '../SharedComponents/Notification';
import Autosuggest from './Autosuggest';
import { UserContext } from '../contexts/user.provider';
import { ProjectContext } from '../contexts/project.provider';
import { ItemsContext } from '../contexts/items.provider';

const ListPage = ({ history, cookies }) => {

  const [showLoader, setShowLoader] = useState(true);
  const { user } = useContext(UserContext);
  const { project } = useContext(ProjectContext);
  const { items, storeItems } = useContext(ItemsContext);
  const firstRender = useRef(true);

  useEffect(() => {
    if (isEmpty(user) || isEmpty(project)) {
      history.push('/login');
    } else {
      ReactGA.pageview('/list');
      setShowLoader(true);
      storeItems(user);      
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if(firstRender.current) return   
    if (!isEmpty(items)) {
      setShowLoader(false);
    }
    if (!isEmpty(items) && items.error) {
      notifyError(items.error);
    }
  }, [items])

  useEffect(() => {
    firstRender.current = false;
  }, [])

  const createNewContainer = () => {
    updateStep(cookies, 2);
    history.push('/new');
  }

  const notifyError = message => toast.error(message);

  const selectContainer = containerId => {
    const { role } = user;

    role === 'forwarder' && updateStep(cookies, 13);
    role === 'customs' && updateStep(cookies, 17);
    role === 'port' && updateStep(cookies, 23);

    history.push(`/details/${containerId}`)
  }

  return (
    <React.Fragment>
      {
        (isEmpty(project) || !project.listPage)
          ? null
          :
          <div className="list-page">
            <Header ctaEnabled>
              <Col md={3} xl={4} className="heading hidden-md-down">
                <span className="heading-text">
                  Welcome to container tracking
            </span>
              </Col>
            </Header>
            {user.canCreateStream ? (
              <div className="cta-wrapper">
                <button className="button create-new-cta" onClick={createNewContainer}>
                  Create new {project.trackingUnit}
                </button>
              </div>
            ) : null}
            <Loader showLoader={showLoader} />
            <div className={`md-block-centered ${showLoader ? 'hidden' : ''}`}>
              <Autosuggest
                items={Object.values(items)}
                project={project}
                onSelect={item => history.push(`/details/${item.containerId}`)}
                trackingUnit={project.trackingUnit}
              />
              <DataTable plain className="list-all">
                <TableHeader>
                  <TableRow>
                    {project.listPage.headers.map((header, index) => (
                      <TableColumn
                        key={header}
                        className={index === 1 ? 'md-text-center' : index === 2 ? 'md-text-right' : ''}
                      >
                        {header}
                      </TableColumn>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.values(items).map((item, idx) => (
                    <React.Fragment key={`${item.containerId || item.itemId}-${idx}`}>
                      {
                        item && (item.containerId || item.itemId)
                          ? (
                            <TableRow
                              key={`${item.containerId || item.itemId}-${idx}`}
                              onClick={() => selectContainer(item.containerId)}
                              className={classNames({
                                'users-container': item.containerId === cookies.get('containerId'),
                              })}
                            >
                              {project.listPage.body.map((entry, index) => (
                                <TableColumn
                                  key={`${item.containerId}-${index}`}
                                  className={
                                    index === 1 ? 'md-text-center' : index === 2 ? 'md-text-right' : ''
                                  }
                                >
                                  {typeof entry === 'string'
                                    ? item[entry]
                                    : entry.map(field => item[field]).join(' → ')}
                                </TableColumn>
                              ))}
                            </TableRow>
                          ) : null
                      }
                    </React.Fragment>
                  ))}
                </TableBody>
              </DataTable>
            </div>
            <Notification />
            <Footer />
            <Tooltip fetchComplete={!showLoader} />
          </div>
      }
    </React.Fragment>
  );

}

export default withCookies(ListPage);
