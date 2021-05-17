import React, { memo, useState, useEffect } from 'react';
import sizeMe from 'react-sizeme';
import { withCookies } from 'react-cookie';
import { TabsContainer, Tabs, Tab } from 'react-md';
import isEmpty from 'lodash/isEmpty';
import StatusList from '../Status';
import Documents from '../Documents';
import Temperature from '../Temperature';
import Explorer from '../Explorer';
import Location from '../Location';
import updateStep from '../../utils/cookie';

const ItemTabs = (props) => {

  const [activeTabIndex, setActiveTabIndex] = useState(props.activeTabIndex);


  ItemTabs.defaultProps = {
    activeTabIndex: 0,
  };

  useEffect(() => {
    setActiveTabIndex(props.activeTabIndex);
  }, [props.activeTabIndex]);

  const onTabChange = newActiveTabIndex => {
    setActiveTabIndex(newActiveTabIndex);
    props.onTabChange(newActiveTabIndex);
  };


  const {
    cookies,
    item,
    statuses,
    itemEvents,
    size,
    locationTracking,
    documentStorage,
    temperatureChart,
    onUploadComplete,
    onAddTemperatureCallback,
    fileUploadEnabled,
  } = props;

  const locations = itemEvents.filter(({ position }) => !isEmpty(position));

  const components = [
    <StatusList key={1} statuses={statuses} />,
    <Explorer key={2} />,
    <Documents key={3} item={item} onUploadComplete={onUploadComplete} fileUploadEnabled={fileUploadEnabled} />,
    <Temperature key={4} data={itemEvents} callback={onAddTemperatureCallback} />,
    <Location key={5} data={locations} />
  ]

  return (
    <div className="tabs-wrapper">
      <TabsContainer
        activeTabIndex={activeTabIndex}
        onTabChange={onTabChange}
      >
        <Tabs tabId="item-details" mobile={size.width <= 768}>
          <Tab label="Status" className="status-tab" onClick={() => updateStep(cookies, 7)} />
          <Tab label="Tangle" className="tangle-tab" onClick={() => updateStep(cookies, 5)} />
          {documentStorage ? (
            <Tab label="Documents" className="documents-tab" onClick={() => updateStep(cookies, 8)} />
          ) : null}
          {temperatureChart ? (
            <Tab label="Temperature" className="temperature-tab" />
          ) : null}
          {locationTracking && item.status === 'Vessel departure' ? (
            <Tab label="Location" className="location-tab" onClick={() => updateStep(cookies, 26)} />
          ) : null}
        </Tabs>
      </TabsContainer>
      { components[activeTabIndex]}
    </div>
  );
}

export default sizeMe({ monitorHeight: false })(withCookies(memo(ItemTabs)));
