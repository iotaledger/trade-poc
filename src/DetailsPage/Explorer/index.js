import React, { Component } from 'react';
import { connect } from 'react-redux';
import List from './List';

class Explorer extends Component {
  render() {
    const { item } = this.props;
    return (
      <div className="explorer-content">
        {item.length > 0 ? <List messages={item} /> : null}
      </div>
    );
  }
}

const mapStateToProps = state => ({
  item: state.item,
});

export default connect(mapStateToProps)(Explorer);
