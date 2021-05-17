import React, { useContext, useEffect, useState } from 'react';
import ReactGA from 'react-ga';
import { withRouter } from 'react-router';
import { withCookies } from 'react-cookie';
import { Button } from 'react-md';
import { Link } from 'react-router-dom';
import { Col } from 'reactstrap';
import isEmpty from 'lodash/isEmpty';
import upperFirst from 'lodash/upperFirst';
import last from 'lodash/last';
import uniqBy from 'lodash/uniqBy';
import pick from 'lodash/pick';
import { toast } from 'react-toastify';
import updateStep from '../utils/cookie';
import Notification from '../SharedComponents/Notification';
import Tooltip from '../SharedComponents/Tooltip';
import Loader from '../SharedComponents/Loader';
import Header from '../SharedComponents/Header';
import Footer from '../SharedComponents/MiniFooter';
import Tabs from './Tabs';
import Details from './Details';
import { fetchItem, appendItemChannel } from '../utils/mam';
import { UserContext } from '../contexts/user.provider';
import { ItemContext } from '../contexts/item.provider';
import { ItemsContext } from '../contexts/items.provider';
import { ProjectContext } from '../contexts/project.provider';

const StatusButtons = ({ statuses, onClick, showLoader }) => {
  if (typeof statuses === 'string') {
    return (
      <Button className={`details-page-button ${statuses.replace(/\s+/g, '-').toLowerCase()} ${showLoader ? 'hidden' : ''}`} raised onClick={() => onClick(statuses)}>
        Confirm {statuses}
      </Button>
    );
  }

  return (
    <div className="detail-section-status-buttons">
      {statuses.map(status => (
        <Button key={status} raised onClick={() => onClick(status)}>
          Confirm {status}
        </Button>
      ))}
    </div>
  );
};

const DetailsPage = ({ history, match, cookies }) => {

  const [showLoader, setShowLoader] = useState(false);
  const [loaderHint, setLoaderHint] = useState(null);
  const [fetchComplete, setFetchComplete] = useState(false);
  const [metadata, setMetadata] = useState([]);
  const [fileUploadEnabled, setFileUploadEnabled] = useState(true);
  const [statusUpdated] = useState(false);
  const [statuses, setStatuses] = useState([]);
  const [currentItem, setCurrentItem] = useState(null);
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  const { user } = useContext(UserContext);
  const { item, storeItem, resetStoredItem } = useContext(ItemContext);
  const { items, storeItems } = useContext(ItemsContext);
  const { project } = useContext(ProjectContext);

  useEffect(() => {
    const { params: { containerId } } = match;
    if (isEmpty(user)) {
      history.push('/login');
    }
    if (!containerId || isEmpty(items)) {
      history.push('/list');
    } else if (isEmpty(item) || item[0].containerId !== containerId) {
      retrieveItem(containerId);
    } else {
      setShowLoader(false);
      setCurrentItem(last(item));
      setStatuses(getUniqueStatuses(item));
    }
    ReactGA.pageview('/details');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (currentItem) setFetchComplete(true);
  }, [currentItem])

  const notifySuccess = message => toast.success(message);
  const notifyError = message => toast.error(message);

  const getUniqueStatuses = itemEvents =>
    uniqBy(itemEvents.map(event => pick(event, ['status', 'timestamp'])), 'status');

  const documentExists = documentName => {
    setShowLoader(false);
    notifyError(`Document named ${documentName} already exists`);
  };

  const appendToItem = async (statusToAppend, metadataToAppend) => {
    const { params: { containerId } } = match;
    const meta = metadataToAppend.length;
    if (statusToAppend) {
      ReactGA.event({
        category: 'Status update',
        action: `Updated status to "${statusToAppend}"`,
        label: `Container ID ${containerId}`
      });
    }

    setShowLoader(true);
    setFetchComplete(false);
    setLoaderHint('Updating Tangle');
    const infos = { item, items, project, match }
    let response;
    try {
       response = await appendItemChannel(metadataToAppend, infos, documentExists, statusToAppend);
    } catch (e) {
      console.error("Could not apppend item to channel:", e)
    }

    if (response) {
      updateStep(cookies, 9);
      statusToAppend === 'Gate-in' && updateStep(cookies, 14);
      statusToAppend === 'Container cleared for export' && updateStep(cookies, 18);
      statusToAppend === 'Container loaded on vessel' && updateStep(cookies, 24);
      statusToAppend === 'Vessel departure' && updateStep(cookies, 25);

      notifySuccess(`${upperFirst(project.trackingUnit)} ${meta ? '' : 'status '}updated`);
      setShowLoader(false);
      setMetadata([]);
      setFileUploadEnabled(true);
      setLoaderHint(null);
      retrieveItem(response);
    } else {
      setShowLoader(false);
      setLoaderHint(null);
      notifyError('Something went wrong');
    }
  };

  const storeItemCallback = itemToStore => {
    storeItem(itemToStore);
  };

  const setStateCalback = (itemForCallback, statusForCallback) => {
    setCurrentItem(itemForCallback);
    setStatuses(statusForCallback);
  };

  const retrieveItem = async containerId => {
    const { trackingUnit } = project;
    const itemToRetrieve = items[containerId];
    setShowLoader(true);
    setLoaderHint('Fetching data');
    resetStoredItem();
    storeItems(user, containerId);
    try {
      await fetchItem(
        itemToRetrieve.mam.root,
        itemToRetrieve.mam.sideKey,
        storeItemCallback,
        setStateCalback
      );
      setShowLoader(false);
      setFetchComplete(true);
      setLoaderHint(null);
    } catch (error) {
      setShowLoader(false);
      setLoaderHint(null);
      notifyError(`Error loading ${trackingUnit} data`);
    }

  };

  const onTabChange = newActiveTabIndex => {
    const { params: { containerId } } = match;
    setActiveTabIndex(newActiveTabIndex);

    const tabs = ['Status', 'Tangle', 'Documents', 'Temperature', 'Location'];

    ReactGA.event({
      category: 'Tab change',
      action: `Selected tab "${tabs[newActiveTabIndex]}"`,
      label: `Container ID ${containerId}`
    });
  };

  const onUploadComplete = uploadedMetadata => {
    const { params: { containerId } } = match;
    setMetadata(uploadedMetadata);
    setFileUploadEnabled(false);
    setActiveTabIndex(2);
    notifySuccess('File upload complete!');
    appendToItem(null, uploadedMetadata);
    ReactGA.event({
      category: 'Document upload',
      action: 'Uploaded document(s)',
      label: `Container ID ${containerId}`
    });

  };

  const onAddTemperature = containerId => {
    ReactGA.event({
      category: 'Temperature added',
      action: 'Temperature added',
      label: `Container ID ${containerId}`
    });

    retrieveItem(containerId);
  };

  const [nextEvents, setNextEvents] = useState(null);

  useEffect(() => {
    if (!currentItem || !currentItem.status) return;
    const nextUserEvents = user.nextEvents[currentItem.status.toLowerCase().replace(/[- ]/g, '')];
    setNextEvents(nextUserEvents);
  }, [user, currentItem]);

  return (
    <React.Fragment>
      {
        !currentItem ?
          <Loader showLoader={showLoader} />
          :
          <div className="details-page">
            <Header ctaEnabled>
              <Col md={3} xl={4} className="heading hidden-md-down">
                <span className="heading-text">
                  #{match.params.containerId},&nbsp;{`${currentItem.departure}  →  ${currentItem.destination}`}
                </span>
              </Col>
            </Header>
            <div className={`loader-wrapper ${showLoader ? '' : 'hidden'}`}>
              <Loader showLoader={showLoader} text={loaderHint} />
            </div>
            <div className="details-wrapper">
              <div className="md-block-centered">
                <div className="route-cta-wrapper">
                  <Link
                    to="/list"
                    className="button secondary back-cta"
                    onClick={() => updateStep(cookies, 10)}
                  >
                    Back
              </Link>
                  <h3 className="ca-title">
                    #{match.params.containerId}
                    <br />
                    {`${currentItem.departure}  →  ${currentItem.destination}`}
                  </h3>
                  {user.canAppendToStream && !statusUpdated && nextEvents ? (
                    <StatusButtons statuses={nextEvents} onClick={(status) => appendToItem(status, metadata)} showLoader={showLoader} />
                  ) : null}
                </div>
                <Tabs
                  activeTabIndex={activeTabIndex}
                  item={currentItem}
                  statuses={statuses}
                  itemEvents={item}
                  locationTracking={project.locationTracking}
                  documentStorage={project.documentStorage}
                  temperatureChart={project.temperatureChart}
                  fileUploadEnabled={fileUploadEnabled}
                  onTabChange={onTabChange}
                  onUploadComplete={onUploadComplete}
                  onAddTemperatureCallback={onAddTemperature}
                />
                <Details item={currentItem} fields={project.detailsPage} />
              </div>
            </div>
            <Notification />
            <Tooltip fetchComplete={fetchComplete} activeTabIndex={activeTabIndex} />
            <Footer />
          </div>
      }

    </React.Fragment>
  );
}

export default withRouter(withCookies(DetailsPage));
