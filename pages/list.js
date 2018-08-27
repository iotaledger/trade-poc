import React, { Component } from 'react';
import PropTypes from 'prop-types'; // ES6
import { toast } from 'react-toastify';
import { Button, DataTable, TableHeader, TableBody, TableRow, TableColumn } from 'react-md';
import { isEmpty } from 'lodash';
//import { storeItems } from '../store/items/actions';
import Loader from '../components/Loader';
import Header from '../components/Header';
import Notification from '../components/Notification';
import Autosuggest from '../components/Autosuggest';
import '../static/assets/scss/listPage.scss';

class ListPage extends Component {
  state = {
    showLoader: false,
  };

  componentDidMount() {
    /* const { project, user, history, items } = this.props;
    if (isEmpty(user) || isEmpty(project)) {
      history.push('/login');
    } else {
      if (isEmpty(items.data) && user.previousEvent) {
        this.setState({ showLoader: true });
         this.props.storeItems(user);
      }
    } */
  }

  componentWillReceiveProps(nextProps) {
    /*
    const {
      items: { data, error },
    } = nextProps;
    if (error) {
      this.notifyError(error);
    }
    if (
      isEmpty(this.props.items.data) &&
      nextProps.user.previousEvent &&
      !this.props.user.previousEvent
    ) {
      this.setState({ showLoader: true });
      // this.props.storeItems(nextProps.user);
    }
    if (!isEmpty(data) || !isEmpty(this.props.items.data) || this.props.user.previousEvent) {
      this.setState({ showLoader: false });
    } */
  }

  notifyError = message => toast.error(message);

  render() {
    const {
      project,
      user,
      items: { data },
    } = this.props;
    const history = { push: () => {} }
    const { showLoader } = this.state;

    if (!project || !project.listPage) return <div />;

    return (
      <div className="app">
        <Header>
          <p>
            Welcome to {project.projectName},<br />
            {user.name}
          </p>
        </Header>
        {user.canCreateStream ? (
          <div className="cta-wrapper">
            <Button className="listPage-button" raised onClick={() => history.push('/new')}>
              Create new {project.trackingUnit}
            </Button>
          </div>
        ) : null}
        <Loader showLoader={showLoader} />
        <div className={`md-block-centered ${showLoader ? 'hidden' : ''}`}>
          <Autosuggest
            items={data}
            project={project}
            onSelect={item => history.push(`/details/${item.itemId}`)}
            trackingUnit={project.trackingUnit}
          />
          <DataTable plain>
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
              {data.map(item => (
                <TableRow key={item.itemId} onClick={() => history.push(`/details/${item.itemId}`)}>
                  {project.listPage.body.map((entry, index) => (
                    <TableColumn
                      key={`${item.itemId}-${index}`}
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
              ))}
            </TableBody>
          </DataTable>
        </div>
        <Notification />
      </div>
    );
  }
}
/*
user

*/

/*
itemes

*/

/*
project

*/
ListPage.propTypes = {
  project: PropTypes.object
};

ListPage.defaultProps = {
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
/*
const mapStateToProps = state => ({
  project: state.project,
  user: state.user,
  items: state.items,
});

const mapDispatchToProps = dispatch => ({
  storeItems: user => dispatch(storeItems(user)),
});
*/
export default ListPage
