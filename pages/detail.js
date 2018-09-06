
import React, { Component } from 'react';
import PropTypes from 'prop-types'; // ES6
//import { connect } from 'react-redux';
import { Button } from 'react-md';
import { isEmpty, find, last, uniqBy, pick, upperFirst } from 'lodash';
//import { toast } from 'react-toastify';
// import { storeItem } from '../store/item/actions';
import Notification from '../components/Notification';
import Loader from '../components/Loader';
import Header from '../components/Header';
import Tabs from '../components/Tabs';
import Details from '../components/Details';
//import FilesUpload from '../components/Documents/FilesUpload';
import { validateIntegrity } from '../components/Documents/DocumentIntegrityValidator';
//import { fetchItem, appendItemChannel } from '../utils/mam';
// import { reassignOwnership } from '../utils/firebase';
//import '../static/assets/scss/detailsPage.scss';
import { fetchChannel } from '../utils/mam'
import projectJson from '../config/project.json'

const fetchItem = () => {}
const appendItemChannel = () => {}

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

  static async getInitialProps(context) {
    const root = context.query.root
    return { root, settings: projectJson.settings, user: {canCreateStream: true, name: 'fake name'}, project: {} }
  }
  constructor(props) {
    super(props)
    this.state = {
      showLoader: false,
      fetchComplete: false,
      metadata: [],
      fileUploadEnabled: true,
      statusUpdated: false,
      statuses: [],
      item: null,
      activeTabIndex: 0,
    };
  }

  async componentDidMount() {
    const channelData = await fetchChannel(this.props.root)
    this.setState({
      showLoader: false,
      fetchComplete: true,
      item: last(channelData),
      statuses: this.getUniqueStatuses(channelData),
    });
      /*
    if (!itemId || isEmpty(items)) {
      history.push('/');
    } else if (isEmpty(item) || item[0].itemId !== itemId) {
      this.retrieveItem(itemId);
    } else {
      // ignore for now !!!! await validateIntegrity(last(item));
      this.setState({
        showLoader: false,
        fetchComplete: true,
        item: last(item),
        statuses: this.getUniqueStatuses(item),
      });
    } */
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
      // reassignOwnership(project, user, item, status);
    } else {
      this.setState({ showLoader: false });
      this.notifyError('Something went wrong');
    }
  };

  storeItemCallback = item => {
    // this.props.storeItem(item);
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
    } = this.props;

    const {
      trackingUnit, documentStorage, locationTracking, temperatureChart, detailsPage
    } = this.props.settings;

    if (!item) return <Loader showLoader={showLoader} />;

    //const nextEvents = user.nextEvents[item.status.toLowerCase().replace(/[- ]/g, '')];
    const nextEvents = "fake event"
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
        {/*documentStorage && fileUploadEnabled && user.canUploadDocuments ? (
          <FilesUpload
            uploadComplete={this.onUploadComplete}
            pathTofile={`${trackingUnit.replace(/\s/g, '')}/${item.itemId}`}
            existingDocuments={item.documents}
          />
        ) : null*/}
        <Notification />
      </div>
    );
  }
}
/*
const mapStateToProps = state => ({
  user: state.user,
  item: state.item,
  items: state.items.data,
  project: state.project,
});

const mapDispatchToProps = dispatch => ({
  storeItem: item => dispatch(storeItem(item)),
}); */
DetailsPage.propTypes = {
  project: PropTypes.object
};

DetailsPage.defaultProps = {
  user: {
    "id": "user001",
    "name": "Mr. John Doe",
    "role": "owner",
    "userId": "user001",
    "canAppendToStream": true,
    "canCreateStream": true,
    "canUploadDocuments": true,
    "nextEvents": {
      "rackannounced": "Delivery to distributor"
    },
    "previousEvent": [
      "Rack announced",
      "Return to owner"
    ]
  },
  item: [{
          "itemId": "12345",
          "mam": {
            "next": "WQXMWIWDJBGXTEEZAZKVFQKSXCASLEAOVIDFYNOKAVSUIPAODVFOCDWFMQTVZMDDOFYMUZTLVPKYBSILT",
            "root": "F9UUOKYOUBVGVERC9P9PBKTPRYASVWBYMUEUPFDHIOEZFQGGRZCYPLU99QAJRMTSVSPXIWMTTTDBUTNYF",
            "secretKey": "JMZJB9TGPQQHZTMZBUKO",
            "seed": "ZFLFODGXHAPHYBUCETZLJUOMKKNFVGGAYAOULRKWDSSUCOTDLQLWMTJERH9DQKXM9RMJQKAXNVEBJQZKG",
            "start": 3
          },
          "owner": "user001",
          "status": "Delivery to distributor",
          "timestamp": 1534763056830
    }],
  items: {
    "data": [
      {
        "itemId": "12345",
        "mam": {
          "next": "WQXMWIWDJBGXTEEZAZKVFQKSXCASLEAOVIDFYNOKAVSUIPAODVFOCDWFMQTVZMDDOFYMUZTLVPKYBSILT",
          "root": "F9UUOKYOUBVGVERC9P9PBKTPRYASVWBYMUEUPFDHIOEZFQGGRZCYPLU99QAJRMTSVSPXIWMTTTDBUTNYF",
          "secretKey": "JMZJB9TGPQQHZTMZBUKO",
          "seed": "ZFLFODGXHAPHYBUCETZLJUOMKKNFVGGAYAOULRKWDSSUCOTDLQLWMTJERH9DQKXM9RMJQKAXNVEBJQZKG",
          "start": 3
        },
        "owner": "user001",
        "status": "Delivery to distributor",
        "timestamp": 1534763056830
      }
    ],
    "error": null
  },
  project: {
    "detailsPage": {
      "body": [
        "owner",
        "itemId",
        "status",
        "timestamp"
      ],
      "headers": [
        "Glass manufacturer",
        "Window Transport Rack ID",
        "Status",
        "Last updated"
      ],
      "title": "itemId"
    },
    "documentStorage": true,
    "fields": [
      "itemId",
      "owner",
      "status",
      "timestamp"
    ],
    "firebaseFields": [
      "itemId",
      "owner",
      "status",
      "timestamp"
    ],
    "listPage": {
      "body": [
        "itemId",
        "owner",
        "status"
      ],
      "headers": [
        "Window transport rack ID",
        "Glass manufacturer",
        "Status"
      ]
    },
    "locationTracking": false,
    "projectName": "window transport rack tracking",
    "roleUserMapping": {
      "distributor": "user003",
      "forwarder": "user002",
      "manufacturer": "user004",
      "owner": "user001"
    },
    "roles": [
      "owner",
      "distributor",
      "forwarder",
      "manufacturer"
    ],
    "temperatureChart": false,
    "trackingUnit": "rack",
    "events": {
      "distributor": {
        "canAppendToStream": true,
        "canCreateStream": false,
        "canUploadDocuments": true,
        "nextEvents": {
          "deliverytodistributor": [
            "Handover to forwarder",
            "Delivery to manufacturer"
          ],
          "returntodistributor": "Return to owner"
        },
        "previousEvent": [
          "Delivery to distributor",
          "Return to distributor"
        ]
      },
      "forwarder": {
        "canAppendToStream": true,
        "canCreateStream": false,
        "canUploadDocuments": true,
        "nextEvents": {
          "handovertoforwarder": "Delivery to manufacturer",
          "returntoforwarder": "Return to distributor"
        },
        "previousEvent": [
          "Handover to forwarder",
          "Return to forwarder"
        ]
      },
      "manufacturer": {
        "canAppendToStream": true,
        "canCreateStream": false,
        "canUploadDocuments": true,
        "nextEvents": {
          "deliverytomanufacturer": [
            "Return to forwarder",
            "Return to distributor",
            "Return to owner"
          ]
        },
        "previousEvent": [
          "Delivery to manufacturer"
        ]
      },
      "owner": {
        "canAppendToStream": true,
        "canCreateStream": true,
        "canUploadDocuments": true,
        "nextEvents": {
          "rackannounced": "Delivery to distributor"
        },
        "previousEvent": [
          "Rack announced",
          "Return to owner"
        ]
      }
    }
  }
};

export default DetailsPage;
