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
import Head from '../components/Head';

//import '../static/assets/scss/listPage.scss';
import { fetchChannels } from '../utils/mam'
import projectJson from '../config/project.json'
import Router from 'next/router'

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
      const allChannelData = await fetchChannels(channelRoots)
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
        <Head />
        <Header>
          <p>
            Welcome to {this.props.settings.projectName},<br />
            {user.name}
          </p>
        </Header>
        {user.canCreateStream ? (
          <div className="cta-wrapper">
            <button className="listPage-button" raised onClick={() => Router.push('/new')}>
              Create new {this.props.settings.trackingUnit}
            </button>
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
                <TableRow key={item.timestamp} onClick={() => Router.push(`/detail?root=${item.root}`)}>
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
        <style jsx global>{`
        @mixin button {
          letter-spacing: 1.5px;
          text-transform: uppercase;
          text-align: center;
          position: relative;
          cursor: pointer;
          overflow: hidden;
          white-space: nowrap;
          display: inline-block;
          color: #ffffff;
          background: linear-gradient(90deg,#18817c,#22b1ab);
        }

        .cta-wrapper {
          display: flex;
          flex-direction: row;
          justify-content: center;
          height: 92px;
          background-color: #ffffff;
          box-shadow: 0px 5px 13px -2px rgba(155, 155, 155,0.5);

          .listPage-button {
            @include button();
            width: 350px;
            margin: auto;
            font-size: 18px;
            padding: 26px;
            line-height: 2px;
            border-radius: 45px;
          }
        }

        .md-data-table {
          max-width: 1092px;
          margin: 0 auto;

          thead tr.md-table-row, tbody tr.md-table-row {
            border-bottom: 1px solid rgb(201, 201, 201);
          }

          tbody tr.md-table-row {
            cursor: pointer;
          }

          .md-table-column {
            font-size: 18px;
            font-weight: 700;
            width: 33.3%;
            height: 81px;

            &.md-text {
              color: rgb(63, 63, 63);
            }

            &.md-text--secondary {
              color: rgb(151, 151, 151);
            }
          }
        }
        `}</style>
      </div>
    );
  }
}

ListPage.propTypes = {
  project: PropTypes.object
};

export default ListPage
