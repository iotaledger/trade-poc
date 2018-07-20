import React, { Component } from 'react';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import { Button, DataTable, TableHeader, TableBody, TableRow, TableColumn } from 'react-md';
import { isEmpty } from 'lodash';
import { storeItems } from '../store/items/actions';
import Loader from '../SharedComponents/Loader';
import Header from '../SharedComponents/Header';
import Notification from '../SharedComponents/Notification';
import Autosuggest from './Autosuggest';
import '../assets/scss/listPage.scss';

class ListPage extends Component {
  state = {
    showLoader: false,
  };

  componentDidMount() {
    const { project, user, history, items } = this.props;
    if (isEmpty(user) || isEmpty(project)) {
      history.push('/login');
    } else {
      if (isEmpty(items.data) && user.previousEvent) {
        this.setState({ showLoader: true });
        this.props.storeItems(user);
      }
    }
  }

  componentWillReceiveProps(nextProps) {
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
      this.props.storeItems(nextProps.user);
    }
    if (!isEmpty(data) || !isEmpty(this.props.items.data) || this.props.user.previousEvent) {
      this.setState({ showLoader: false });
    }
  }

  notifyError = message => toast.error(message);

  render() {
    const {
      project,
      user,
      history,
      items: { data },
    } = this.props;
    const { showLoader } = this.state;

    if (!project || !project.listPage) return <div />;

    return (
      <div className="App">
        <Header>
          <p>
            Welcome to {project.projectName},<br />
            {user.name}
          </p>
        </Header>
        {user.canCreateStream ? (
          <div className="ctaWrapper">
            <Button raised onClick={() => history.push('/new')}>
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

const mapStateToProps = state => ({
  project: state.project,
  user: state.user,
  items: state.items,
});

const mapDispatchToProps = dispatch => ({
  storeItems: user => dispatch(storeItems(user)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ListPage);
