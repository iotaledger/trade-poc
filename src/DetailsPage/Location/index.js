import React, { Component } from 'react';
import { fromJS } from 'immutable';
import { withRouter } from 'react-router';
import sizeMe from 'react-sizeme';
import isEmpty from 'lodash/isEmpty';
import MapGL, { Marker } from 'react-map-gl';
import RoutePin from './route-pin';
import { lineLayer, defaultMapStyle } from './map-style';

const simulatedRoute = [
  {lat: 51.94421197058105, lng: 4.130001068115234},
  {lat: 51.95733135422154, lng: 4.128284454345703},
  {lat: 51.965899201787714, lng: 4.116783142089844},
  {lat: 51.973460817611695, lng: 4.0924072265625},
  {lat: 51.99471111282549, lng: 4.044857025146484},
  {lat: 52.09638241034154, lng: 3.768310546875},
  {lat: 52.06262321411284, lng: 3.2958984375},
  {lat: 51.72702815704774, lng: 2.79052734375},
];

const MAPBOX_TOKEN =
  'pk.eyJ1Ijoib2xtdWwiLCJhIjoiY2pja2Y4eHFxNHU3ajJxbzVhMXhyYmU3ZyJ9.Q6xw86TWQTovCeRcm3qomw';

class Location extends Component {
  mapStyle = defaultMapStyle;

  state = {
    data: [],
    viewport: {
      latitude: 51.91,
      longitude: 4.1526,
      zoom: 11,
      bearing: 0,
      pitch: 0,
    },
    settings: {
      width: this.props.size.width,
      height: Math.max(document.documentElement.clientHeight, window.innerHeight || 0),
      dragPan: true,
      dragRotate: true,
      scrollZoom: true,
      doubleClickZoom: true,
      minZoom: 0,
      maxZoom: 20,
      minPitch: 0,
      maxPitch: 85,
    },
  };

  componentDidMount() {
    window.addEventListener('resize', this._resize);
    this._resize();
  }

  componentWillReceiveProps(nextProps) {
    const { data } = nextProps;
    this.setState({ data: [...data] }, () => this.state.data.map(this.updateLine));
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this._resize);
  }

  _resize = () => {
    // Make map fill screen
    this.setState({
      viewport: {
        ...this.state.viewport,
        width: this.props.size.width,
        height: this.props.height || window.innerHeight,
      },
    });
  };

  // for drawing lines
  toGeoJson = () => {
    return this.state.data.map(event => [event.position.lng, event.position.lat]);
  };

  // draw lines
  updateLine = data => {
    if (!this.mapStyle.hasIn(['sources', data.containerId])) {
      this.mapStyle = this.mapStyle
        .setIn(['sources', data.containerId], fromJS({ type: 'geojson' }))
        .set('layers', this.mapStyle.get('layers').push(lineLayer(data.containerId)));

      this.mapStyle = this.mapStyle.setIn(
        ['sources', data.containerId, 'data'],
        fromJS({
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: [[data.position.lng, data.position.lat]],
          },
        })
      );
    } else {
      this.mapStyle = this.mapStyle.updateIn(
        ['sources', data.containerId, 'data', 'geometry', 'coordinates'],
        list => fromJS(this.toGeoJson())
      );
    }
  };

  renderMarker = (containerId, position, index) => {
    this.updateLine({ containerId, position });
    return (
      <Marker key={containerId + '-' + index} longitude={position.lng} latitude={position.lat}>
        <RoutePin size={Math.round(this.state.viewport.zoom)} />
      </Marker>
    )
  };

  render() {
    const { match: { params: { containerId } } } = this.props;
    const { data, viewport, settings } = this.state;

    let mapData = []
    if (!isEmpty(data)) {
      mapData = data.filter(({ position }) => position && !isEmpty(position));
    }

    if (!mapData.length) {
      mapData = simulatedRoute.map(position => ({ containerId, position }));
    }

    return (
      <MapGL
        ref={reactMap => (this.reactMap = reactMap)}
        {...viewport}
        {...settings}
        mapStyle={this.mapStyle}
        onViewportChange={viewport => this.setState({ viewport })}
        mapboxApiAccessToken={MAPBOX_TOKEN}
      >
        {
          mapData.map(({ containerId, position }, index) =>
            this.renderMarker(containerId, position, index)
          )
        }
      </MapGL>
    );
  }
}

export default sizeMe({ monitorHeight: true })(withRouter(Location));
