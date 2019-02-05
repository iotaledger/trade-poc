import React, { Component } from 'react';
import ReactGA from 'react-ga';
import { connect } from 'react-redux';
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
import { storeItems } from '../store/items/actions';
import { storeItem, resetStoredItem } from '../store/item/actions';
import updateStep from '../utils/cookie';
import Notification from '../SharedComponents/Notification';
import Tooltip from '../SharedComponents/Tooltip';
import Loader from '../SharedComponents/Loader';
import Header from '../SharedComponents/Header';
import Footer from '../SharedComponents/MiniFooter';
import Tabs from './Tabs';
import Details from './Details';
import { fetchItem, appendItemChannel } from '../utils/mam';

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

class DetailsPage extends Component {
  state = {
    showLoader: false,
    loaderHint: null,
    fetchComplete: false,
    metadata: [],
    fileUploadEnabled: true,
    statusUpdated: false,
    statuses: [],
    item: null,
    activeTabIndex: 0,
  };

  async componentDidMount() {
    const {
      user,
      item,
      items,
      history,
      match: {
        params: { containerId },
      },
    } = this.props;
    if (isEmpty(user)) {
      history.push('/login');
    }
    if (!containerId || isEmpty(items)) {
      history.push('/list');
    } else if (isEmpty(item) || item[0].containerId !== containerId) {
      this.retrieveItem(containerId);
    } else {
      this.setState({
        showLoader: false,
        fetchComplete: true,
        item: last(item),
        statuses: this.getUniqueStatuses(item),
      });
    }
    ReactGA.pageview('/details');
  }

  notifySuccess = message => toast.success(message);
  notifyWarning = message => toast.warn(message);
  notifyError = message => toast.error(message);

  getUniqueStatuses = itemEvents =>
    uniqBy(itemEvents.map(event => pick(event, ['status', 'timestamp'])), 'status');

  documentExists = documentName => {
    this.setState({ showLoader: false });
    this.notifyError(`Document named ${documentName} already exists`);
  };

  appendToItem = async status => {
    const { cookies, project, match: { params: { containerId } } } = this.props;
    const { metadata } = this.state;
    const meta = metadata.length;

    if (status) {
      ReactGA.event({
        category: 'Status update',
        action: `Updated status to "${status}"`,
        label: `Container ID ${containerId}`
      });
    }

    this.setState({ showLoader: true, fetchComplete: false, loaderHint: 'Updating Tangle' });
    const response = await appendItemChannel(metadata, this.props, this.documentExists, status);
    if (response) {
      updateStep(cookies, 9);
      status === 'Gate-in' && updateStep(cookies, 14);
      status === 'Container cleared for export' && updateStep(cookies, 18);
      status === 'Container loaded on vessel' && updateStep(cookies, 24);
      status === 'Vessel departure' && updateStep(cookies, 25);

      this.notifySuccess(`${upperFirst(project.trackingUnit)} ${meta ? '' : 'status '}updated`);
      this.setState({
        showLoader: false,
        metadata: [],
        fileUploadEnabled: true,
        loaderHint: null
      });
      this.retrieveItem(response);
    } else {
      this.setState({ showLoader: false, loaderHint: null });
      this.notifyError('Something went wrong');
    }
  };

  storeItemCallback = item => {
    this.props.storeItem(item);
  };

  setStateCalback = (item, statuses) => {
    this.setState({ item, statuses });
  };

  retrieveItem = containerId => {
    const { items, user, project: { trackingUnit } } = this.props;
    const item = items[containerId];
    this.setState({ showLoader: true, loaderHint: 'Fetching data' });
    this.props.resetStoredItem();
    this.props.storeItems(user, containerId);
    const promise = new Promise(async (resolve, reject) => {
      try {
        await fetchItem(
          item.mam.root,
          item.mam.secretKey,
          this.storeItemCallback,
          this.setStateCalback
        );

        this.setState({ showLoader: false, fetchComplete: true, loaderHint: null });
        return resolve();
      } catch (error) {
        this.setState({ showLoader: false, loaderHint: null });
        return reject(this.notifyError(`Error loading ${trackingUnit} data`));
      }
    });

    return promise;
  };

  onTabChange = newActiveTabIndex => {
    const { match: { params: { containerId } } } = this.props;
    this.setState({ activeTabIndex: newActiveTabIndex });

    const tabs = ['Status', 'Tangle', 'Documents', 'Temperature', 'Location'];

    ReactGA.event({
      category: 'Tab change',
      action: `Selected tab "${tabs[newActiveTabIndex]}"`,
      label: `Container ID ${containerId}`
    });
  };

  onUploadComplete = metadata => {
    const { match: { params: { containerId } } } = this.props;

    this.setState({ metadata, fileUploadEnabled: false, activeTabIndex: 2 }, () => {
      this.notifySuccess('File upload complete!');
      this.appendToItem();

      ReactGA.event({
        category: 'Document upload',
        action: 'Uploaded document(s)',
        label: `Container ID ${containerId}`
      });
    });
  };

  onAddTemperature = containerId => {
    ReactGA.event({
      category: 'Temperature added',
      action: 'Temperature added',
      label: `Container ID ${containerId}`
    });

    this.retrieveItem(containerId);
  };

  render() {
    const {
      fileUploadEnabled,
      showLoader,
      loaderHint,
      statusUpdated,
      statuses,
      item,
      fetchComplete,
      activeTabIndex,
    } = this.state;
    const {
      cookies,
      user,
      match: { params: { containerId } },
      project: { documentStorage, locationTracking, temperatureChart, detailsPage },
    } = this.props;

    if (!item) return <Loader showLoader={showLoader} />;

    const nextEvents = user.nextEvents[item.status.toLowerCase().replace(/[- ]/g, '')];

    const containerHeading = (
      <React.Fragment>
        {
          typeof detailsPage.title === 'string'
            ? item[detailsPage.title]
            : detailsPage.title.map(field => item[field]).join(' → ')
        }
      </React.Fragment>
    )

    return (
      <div className="details-page">
        <Header ctaEnabled>
          <Col md={3} xl={4} className="heading hidden-md-down">
            <span className="heading-text">
              #{containerId},&nbsp;{ containerHeading }
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
                #{containerId}
                <br />
                { containerHeading }
              </h3>
              {user.canAppendToStream && !statusUpdated && nextEvents ? (
                <StatusButtons statuses={nextEvents} onClick={this.appendToItem} showLoader={showLoader} />
              ) : null}
            </div>
            <Tabs
              activeTabIndex={activeTabIndex}
              item={item}
              statuses={statuses}
              itemEvents={this.props.item}
              locationTracking={locationTracking}
              documentStorage={documentStorage}
              temperatureChart={temperatureChart}
              fileUploadEnabled={fileUploadEnabled}
              onTabChange={this.onTabChange}
              onUploadComplete={this.onUploadComplete}
              onAddTemperatureCallback={this.onAddTemperature}
            />
            <Details item={item} fields={detailsPage} />
          </div>
        </div>
        <Notification />
        <Tooltip fetchComplete={fetchComplete} activeTabIndex={activeTabIndex} />
        <Footer />
      </div>
    );
  }
}

const mapStateToProps = state => ({
  user: state.user,
  item: state.item,
  items: state.items,
  project: state.project,
});

const mapDispatchToProps = dispatch => ({
  storeItem: item => dispatch(storeItem(item)),
  storeItems: (user, containerId) => dispatch(storeItems(user, containerId)),
  resetStoredItem: () => dispatch(resetStoredItem()),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(withCookies(DetailsPage)));
