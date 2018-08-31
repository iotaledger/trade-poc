import React, { Component } from 'react';
import PropTypes from 'prop-types'; // ES6
import { toast } from 'react-toastify';
import { Button, DataTable, TableHeader, TableBody, TableRow, TableColumn } from 'react-md';
import { isEmpty } from 'lodash';
import axios from 'axios';
import Loader from '../components/Loader';
import Header from '../components/Header';
import Notification from '../components/Notification';
import Autosuggest from '../components/Autosuggest';
import '../static/assets/scss/listPage.scss';
import { fetchChannels } from '../utils/mam'
import projectJson from '../config/project.json'  

class ListPage extends Component {

  static async getInitialProps(context) {
    return { settings: projectJson.settings, user: {canCreateStream: true, name: 'fake name'}, project: {} }
  }

  constructor(props) {
    super(props)
    this.state = {
      showLoader: false,
      items: []
    };
  }

  async componentDidMount() {
      axios
      .get(`/api/channel`)
      .then(async response => {
        this.setState({ showLoader: false });
        const channelRoots = response.data.map(root => root._id)
      
        const allChannelData = await fetchChannels(['a', 'b'])
        this.setState({ items: allChannelData })
      })
  }

  notifyError = message => toast.error(message);

  render() {
    const {
      project,
      user,
    } = this.props;
    const history = { push: () => {} }
    const { showLoader } = this.state;

    if (!project || !this.props.settings.listPage) return <div />;
    return (
      <div className="app">
        <Header>
          <p>
            Welcome to {this.props.settings.projectName},<br />
            {user.name}
          </p>
        </Header>
        {user.canCreateStream ? (
          <div className="cta-wrapper">
            <Button className="listPage-button" raised onClick={() => history.push('/new')}>
              Create new {this.props.settings.trackingUnit}
            </Button>
          </div>
        ) : null}
        <Loader showLoader={showLoader} />
        <div className={`md-block-centered ${showLoader ? 'hidden' : ''}`}>
          {/*<Autosuggest
            items={this.state.items}
            project={project}
            onSelect={item => history.push(`/details/${item.itemId}`)}
            trackingUnit={this.props.settings.trackingUnit}
          />*/}
          <DataTable plain>
            <TableHeader>
              <TableRow>
                {this.props.settings.listPage.headers.map((header, index) => (
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
              {this.state.items.map(item => (
                <TableRow key={item.timestamp} onClick={() => history.push(`/details/${item.itemId}`)}>
                  {this.props.settings.listPage.body.map((entry, index) => (
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

ListPage.propTypes = {
  project: PropTypes.object
};

export default ListPage
