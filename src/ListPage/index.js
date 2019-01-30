import React, { Component } from 'react';
import ReactGA from 'react-ga';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import { Col } from 'reactstrap';
import { withCookies } from 'react-cookie';
import classNames from 'classnames';
import { DataTable, TableHeader, TableBody, TableRow, TableColumn } from 'react-md';
import isEmpty from 'lodash/isEmpty';
import updateStep from '../utils/cookie';
import { storeItems } from '../store/items/actions';
import Tooltip from '../SharedComponents/Tooltip';
import Loader from '../SharedComponents/Loader';
import Header from '../SharedComponents/Header';
import Footer from '../SharedComponents/MiniFooter';
import Notification from '../SharedComponents/Notification';
import Autosuggest from './Autosuggest';

class ListPage extends Component {
  state = {
    showLoader: false,
  };

  componentDidMount() {
    const { project, user, history, items } = this.props;
    if (isEmpty(user) || isEmpty(project)) {
      history.push('/login');
    } else {
      ReactGA.pageview('/list');
      if (isEmpty(items) && user.previousEvent) {
        this.setState({ showLoader: true });
        this.props.storeItems(user);
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    const { items } = nextProps;
    if (items.error) {
      this.notifyError(items.error);
    }
    if (
      isEmpty(this.props.items) &&
      nextProps.user.previousEvent &&
      !this.props.user.previousEvent
    ) {
      this.setState({ showLoader: true });
      this.props.storeItems(nextProps.user);
    }
    if (!isEmpty(this.props.items) || this.props.user.previousEvent) {
      this.setState({ showLoader: false });
    }
  }

  createNewContainer = () => {
    const { cookies, history } = this.props;
    updateStep(cookies, 2);
    history.push('/new');
  }

  notifyError = message => toast.error(message);

  selectContainer = containerId => {
    const { cookies, history, user: { role } } = this.props;

    role === 'forwarder' && updateStep(cookies, 13);
    role === 'customs' && updateStep(cookies, 17);
    role === 'port' && updateStep(cookies, 23);

    history.push(`/details/${containerId}`)
  }

  render() {
    const { cookies, project, user, history, items } = this.props;
    const { showLoader } = this.state;

    if (isEmpty(project) || !project.listPage) return <div />;

    return (
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
            <button className="button create-new-cta" onClick={this.createNewContainer}>
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
              {Object.values(items).map(item => (
                <TableRow
                  key={item.containerId || item.itemId}
                  onClick={() => this.selectContainer(item.containerId)}
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
              ))}
            </TableBody>
          </DataTable>
        </div>
        <Notification />
        <Footer />
        <Tooltip fetchComplete={!showLoader} />
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
)(withCookies(ListPage));
