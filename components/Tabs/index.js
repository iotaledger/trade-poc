import React, { PureComponent } from 'react';
import sizeMe from 'react-sizeme';
import { TabsContainer, Tabs, Tab } from 'react-md';
import { isEmpty, last } from 'lodash';
import StatusList from '../Status';
import Documents from '../Documents';
import Temperature from '../Temperature';
import Location from '../Location';
import '../../static/assets/scss/tabs.scss';

class ItemTabs extends PureComponent {
  state = {
    activeTabIndex: this.props.activeTabIndex,
  };

  static defaultProps = {
    activeTabIndex: 0,
  };

  componentWillReceiveProps(nextProps) {
    this.setState({ activeTabIndex: nextProps.activeTabIndex });
  }

  onTabChange = newActiveTabIndex => {
    this.setState({ activeTabIndex: newActiveTabIndex });
  };

  render() {
    const {
      item,
      statuses,
      itemEvents,
      size,
      fetchComplete,
      locationTracking,
      documentStorage,
      temperatureChart,
    } = this.props;
    const locations = itemEvents.filter(({ position }) => !isEmpty(position));

    return (
      <TabsContainer
        className="tabsWrapper"
        activeTabIndex={this.state.activeTabIndex}
        onTabChange={this.onTabChange}
      >
        <Tabs tabId="item-details" mobile={size.width <= 768}>
          <Tab label="Status">
            <StatusList statuses={statuses} />
          </Tab>
          {documentStorage && item.documents && item.documents.length > 0 ? (
            <Tab label="Documents">
              <Documents item={item} />
            </Tab>
          ) : null}
          {temperatureChart && itemEvents && last(itemEvents) && last(itemEvents).temperature ? (
            <Tab label="Temperature">
              <Temperature data={itemEvents} />
            </Tab>
          ) : null}
          {locationTracking &&
          fetchComplete &&
          itemEvents &&
          last(itemEvents) &&
          locations.length > 0 ? (
            <Tab label="Location">
              <Location data={locations} />
            </Tab>
          ) : null}
        </Tabs>
      </TabsContainer>
    );
  }
}

export default sizeMe({ monitorHeight: false })(ItemTabs);
