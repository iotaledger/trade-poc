import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button } from 'react-md';
import { isEmpty, find, last, uniqBy, pick, upperFirst } from 'lodash';
import { toast } from 'react-toastify';
import { storeItem } from '../store/item/actions';
import Notification from '../SharedComponents/Notification';
import Loader from '../SharedComponents/Loader';
import Header from '../SharedComponents/Header';
import Tabs from './Tabs';
import Details from './Details';
import FilesUpload from './Documents/FilesUpload';
import { validateIntegrity } from './Documents/DocumentIntegrityValidator';
import { fetchItem, appendItemChannel } from '../utils/mam';
import { reassignOwnership } from '../utils/firebase';
import '../assets/scss/detailsPage.scss';

const StatusButtons = ({ statuses, onClick }) => {
  if (typeof statuses === 'string') {
    return (
      <Button className="details-page-button" raised onClick={() => onClick(statuses)}>
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
        params: { itemId },
      },
    } = this.props;
    if (isEmpty(user)) {
      history.push('/login');
    }
    if (!itemId || isEmpty(items)) {
      history.push('/');
    } else if (isEmpty(item) || item[0].itemId !== itemId) {
      this.retrieveItem(itemId);
    } else {
      await validateIntegrity(last(item));
      this.setState({
        showLoader: false,
        fetchComplete: true,
        item: last(item),
        statuses: this.getUniqueStatuses(item),
      });
    }
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
    const { user, project } = this.props;
    const { metadata, item } = this.state;
    const meta = metadata.length;
    this.setState({ showLoader: true });
    const response = await appendItemChannel(metadata, this.props, this.documentExists, status);
    if (response) {
      this.notifySuccess(`${upperFirst(project.trackingUnit)} ${meta ? '' : 'status '}updated`);
      this.setState({
        showLoader: false,
        metadata: [],
        fileUploadEnabled: true,
      });
      this.retrieveItem(response);
      reassignOwnership(project, user, item, status);
    } else {
      this.setState({ showLoader: false });
      this.notifyError('Something went wrong');
    }
  };

  storeItemCallback = item => {
    this.props.storeItem(item);
  };

  setStateCalback = (item, statuses) => {
    this.setState({ item, statuses });
  };

  retrieveItem = itemId => {
    const {
      items,
      project: { trackingUnit },
    } = this.props;
    const item = find(items, { itemId });
    this.setState({ showLoader: true });
    const promise = new Promise(async (resolve, reject) => {
      try {
        const itemEvent = await fetchItem(
          item.mam.root,
          item.mam.secretKey,
          this.storeItemCallback,
          this.setStateCalback
        );

        await validateIntegrity(itemEvent);
        this.setState({ showLoader: false, fetchComplete: true });
        return resolve();
      } catch (error) {
        this.setState({ showLoader: false });
        return reject(this.notifyError(`Error loading ${trackingUnit} data`));
      }
    });

    return promise;
  };

  onUploadComplete = metadata => {
    this.setState({ metadata, fileUploadEnabled: false, activeTabIndex: 1 }, () => {
      this.notifySuccess('File upload complete!');
      this.appendToItem();
    });
  };

  render() {
    const {
      fileUploadEnabled,
      showLoader,
      statusUpdated,
      statuses,
      item,
      fetchComplete,
      activeTabIndex,
    } = this.state;
    const {
      user,
      project: { trackingUnit, documentStorage, locationTracking, temperatureChart, detailsPage },
    } = this.props;

    if (!item) return <Loader showLoader={showLoader} />;

    const nextEvents = user.nextEvents[item.status.toLowerCase().replace(/[- ]/g, '')];

    return (
      <div>
        <Header>
          <p>
            Welcome to {trackingUnit} tracking,<br />
            {user.name || user.role}
          </p>
        </Header>
        <div className={`loader-wrapper ${showLoader ? '' : 'hidden'}`}>
          <Loader showLoader={showLoader} />
        </div>
        <div className="details-wrapper">
          <div className="md-block-centered">
            <div className="route-cta-wrapper">
              <h1 className="ca-title">
                {typeof detailsPage.title === 'string'
                  ? item[detailsPage.title]
                  : detailsPage.title.map(field => item[field]).join(' → ')}
              </h1>
              {user.canAppendToStream && !statusUpdated && nextEvents ? (
                <StatusButtons statuses={nextEvents} onClick={this.appendToItem} />
              ) : null}
            </div>
            <Tabs
              activeTabIndex={activeTabIndex}
              item={item}
              statuses={statuses}
              itemEvents={this.props.item}
              fetchComplete={fetchComplete}
              locationTracking={locationTracking}
              documentStorage={documentStorage}
              temperatureChart={temperatureChart}
            />
            <Details item={item} fields={detailsPage} />
          </div>
        </div>
        {documentStorage && fileUploadEnabled && user.canUploadDocuments ? (
          <FilesUpload
            uploadComplete={this.onUploadComplete}
            pathTofile={`${trackingUnit.replace(/\s/g, '')}/${item.itemId}`}
            existingDocuments={item.documents}
          />
        ) : null}
        <Notification />
      </div>
    );
  }
}

const mapStateToProps = state => ({
  user: state.user,
  item: state.item,
  items: state.items.data,
  project: state.project,
});

const mapDispatchToProps = dispatch => ({
  storeItem: item => dispatch(storeItem(item)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DetailsPage);
