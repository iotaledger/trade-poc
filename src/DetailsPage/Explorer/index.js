import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import isEmpty from 'lodash/isEmpty';
import { fetch } from './MAM';
import List from './List';
import Loader from '../../SharedComponents/Loader';

class Explorer extends Component {
  state = {
    messages: [],
    showLoader: false,
  };

  appendToMessages = message => this.setState({ messages: [...this.state.messages, message] });

  fetchComplete = () => this.setState({ showLoader: false });

  startFetch = ({ mam: { root, secretKey } }) => {
    if (this.state.showLoader || root || secretKey) return;
    this.setState({ showLoader: true, messages: [] });
    fetch(root, secretKey, this.appendToMessages, this.fetchComplete);
  };

  render() {
    const { item, items, history, match: { params: { containerId } } } = this.props;
    if (!containerId || isEmpty(items)) {
      history.push('/');
    } else if (isEmpty(item) || item[0].containerId !== containerId) {
      this.startFetch(items[containerId]);
    }
    const { showLoader } = this.state;
    return (
      <div className="explorer-content">
        <div className={`loaderWrapper ${showLoader ? '' : 'hidden'}`}>
          <Loader showLoader={showLoader} />
        </div>
        {item.length > 0 ? <List messages={item} /> : null}
      </div>
    );
  }
}

const mapStateToProps = state => ({
  item: state.item,
  items: state.items,
});

export default connect(mapStateToProps)(withRouter(Explorer));
