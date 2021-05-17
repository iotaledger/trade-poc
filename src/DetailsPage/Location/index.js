import React, { useEffect, useState } from 'react';
import { fromJS } from 'immutable';
import { withRouter } from 'react-router';
import sizeMe from 'react-sizeme';
import isEmpty from 'lodash/isEmpty';
import MapGL, { Marker } from 'react-map-gl';
import RoutePin from './route-pin';
import { lineLayer, defaultMapStyle } from './map-style';

const simulatedRoute = [
  { lat: 51.94421197058105, lng: 4.130001068115234 },
  { lat: 51.95733135422154, lng: 4.128284454345703 },
  { lat: 51.965899201787714, lng: 4.116783142089844 },
  { lat: 51.973460817611695, lng: 4.0924072265625 },
  { lat: 51.99471111282549, lng: 4.044857025146484 },
  { lat: 52.09638241034154, lng: 3.768310546875 },
  { lat: 52.06262321411284, lng: 3.2958984375 },
  { lat: 51.72702815704774, lng: 2.79052734375 },
];

const MAPBOX_TOKEN =
  'pk.eyJ1Ijoib2xtdWwiLCJhIjoiY2pja2Y4eHFxNHU3ajJxbzVhMXhyYmU3ZyJ9.Q6xw86TWQTovCeRcm3qomw';

const Location = (props) => {
  let mapStyle = defaultMapStyle;
  let reactMap;

  const [data, setData] = useState([]);
  const [mapData, setMapData] = useState([]);
  const [viewport, setViewport] = useState({
    latitude: 51.91,
    longitude: 4.1526,
    zoom: 11,
    bearing: 0,
    pitch: 0,
  });
  const [settings, setSettings] = useState({
    width: props.size.width,
    height: Math.max(document.documentElement.clientHeight, window.innerHeight || 0),
    dragPan: true,
    dragRotate: true,
    scrollZoom: true,
    doubleClickZoom: true,
    minZoom: 0,
    maxZoom: 20,
    minPitch: 0,
    maxPitch: 85,
  });


  useEffect(() => {
    const { match: { params: { containerId } } } = props;

    setMapData([]);
    if (!isEmpty(data)) {
      setMapData(data.filter(({ position }) => position && !isEmpty(position)));
    }

    if (!mapData.length) {
      setMapData(simulatedRoute.map(position => ({ containerId, position })));
    }

    window.addEventListener('resize', _resize);
    _resize();
    return () => {
      window.removeEventListener('resize', _resize);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const propsData = props.data;
    setData([...propsData]);
  }, [props.data]);

  useEffect(() => {
    data.map(updateLine);
  }, [data]); // eslint-disable-line react-hooks/exhaustive-deps

  const _resize = () => {
    // Make map fill screen
    setViewport(prevViewport => {
      return {
        ...prevViewport,
        width: props.size.width,
        height: props.height || window.innerHeigh
      }
    });
  };

  // for drawing lines
  const toGeoJson = () => {
    return data.map(event => [event.position.lng, event.position.lat]);
  };

  // draw lines
  const updateLine = updateData => {
    if (!mapStyle.hasIn(['sources', updateData.containerId])) {
      mapStyle = mapStyle
        .setIn(['sources', updateData.containerId], fromJS({ type: 'geojson' }))
        .set('layers', mapStyle.get('layers').push(lineLayer(updateData.containerId)));

      mapStyle = mapStyle.setIn(
        ['sources', updateData.containerId, 'data'],
        fromJS({
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: [[updateData.position.lng, updateData.position.lat]],
          },
        })
      );
    } else {
      mapStyle = mapStyle.updateIn(
        ['sources', updateData.containerId, 'data', 'geometry', 'coordinates'],
        list => fromJS(toGeoJson())
      );
    }
  };

  const renderMarker = (containerId, position, index) => {
    updateLine({ containerId, position });
    return (
      <Marker key={containerId + '-' + index} longitude={position.lng} latitude={position.lat}>
        <RoutePin size={Math.round(viewport.zoom)} />
      </Marker>
    )
  };

  return (
    <MapGL
      ref={tempReactMap => (reactMap = tempReactMap)}
      {...viewport}
      {...settings}
      mapStyle={mapStyle}
      onViewportChange={tempViewport => setViewport(tempViewport)}
      mapboxApiAccessToken={MAPBOX_TOKEN}
    >
      {
        mapData.map(({ containerId, position }, index) =>
          renderMarker(containerId, position, index)
        )
      }
    </MapGL>
  );
}

export default sizeMe({ monitorHeight: true })(withRouter(Location));
